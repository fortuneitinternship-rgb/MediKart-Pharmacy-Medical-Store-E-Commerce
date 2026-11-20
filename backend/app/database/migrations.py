from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import Boolean, Column, Engine, Float, Integer, String, false, inspect, text


def upgrade_application_schema(engine: Engine) -> None:
    inspector = inspect(engine)
    if not inspector.has_table("orders") or not inspector.has_table("payments"):
        return

    with engine.begin() as connection:
        operations = Operations(MigrationContext.configure(connection))
        inspector = inspect(connection)
        order_columns = {column["name"] for column in inspector.get_columns("orders")}
        payment_columns = {column["name"] for column in inspector.get_columns("payments")}

        if "tax_amount" not in order_columns:
            operations.add_column(
                "orders",
                Column("tax_amount", Float(), nullable=False, server_default="0"),
            )
        if "stock_reserved" not in order_columns:
            operations.add_column(
                "orders",
                Column(
                    "stock_reserved",
                    Boolean(),
                    nullable=False,
                    server_default=false(),
                ),
            )

        if "provider_order_id" not in payment_columns:
            operations.add_column(
                "payments",
                Column("provider_order_id", String(100), nullable=True),
            )
            operations.create_index(
                "ix_payments_provider_order_id",
                "payments",
                ["provider_order_id"],
                unique=True,
            )
        elif not any(
            index["column_names"] == ["provider_order_id"]
            for index in inspector.get_indexes("payments")
        ) and not any(
            constraint["column_names"] == ["provider_order_id"]
            for constraint in inspector.get_unique_constraints("payments")
        ):
            operations.create_index(
                "ix_payments_provider_order_id",
                "payments",
                ["provider_order_id"],
                unique=True,
            )

        if inspector.has_table("product_reviews"):
            review_columns = {
                column["name"]
                for column in inspector.get_columns("product_reviews")
            }
            if "user_id" not in review_columns:
                operations.add_column(
                    "product_reviews",
                    Column("user_id", Integer(), nullable=True),
                )
                operations.create_index(
                    "ix_product_reviews_user_id",
                    "product_reviews",
                    ["user_id"],
                )
            elif not any(
                index["column_names"] == ["user_id"]
                for index in inspector.get_indexes("product_reviews")
            ):
                operations.create_index(
                    "ix_product_reviews_user_id",
                    "product_reviews",
                    ["user_id"],
                )

        connection.execute(
            text(
                "CREATE TABLE IF NOT EXISTS medikart_schema_version "
                "(version VARCHAR(50) PRIMARY KEY)"
            )
        )
        version_table = text(
            "SELECT version FROM medikart_schema_version "
            "WHERE version = '20261106_payment_tax_review_stock'"
        )
        if connection.execute(version_table).first() is None:
            if connection.dialect.name == "sqlite":
                statement = text(
                    "INSERT INTO medikart_schema_version (version) "
                    "VALUES ('20261106_payment_tax_review_stock') "
                    "ON CONFLICT(version) DO NOTHING"
                )
            elif connection.dialect.name == "mysql":
                statement = text(
                    "INSERT IGNORE INTO medikart_schema_version (version) "
                    "VALUES ('20261106_payment_tax_review_stock')"
                )
            elif connection.dialect.name == "postgresql":
                statement = text(
                    "INSERT INTO medikart_schema_version (version) "
                    "VALUES ('20261106_payment_tax_review_stock') "
                    "ON CONFLICT (version) DO NOTHING"
                )
            else:
                raise RuntimeError(
                    f"Schema migrations do not support {connection.dialect.name}."
                )
            connection.execute(statement)


def upgrade_legacy_address_schema(engine: Engine) -> None:
    inspector = inspect(engine)
    if not inspector.has_table("addresses"):
        return

    columns = {
        column["name"]: column
        for column in inspector.get_columns("addresses")
    }
    renames = []

    if "name" in columns and "full_name" not in columns:
        renames.append(("name", "full_name"))
    if "address_line" in columns and "address_line1" not in columns:
        renames.append(("address_line", "address_line1"))

    add_address_line2 = "address_line2" not in columns
    if not renames and not add_address_line2:
        return

    with engine.begin() as connection:
        operations = Operations(MigrationContext.configure(connection))

        for old_name, new_name in renames:
            column = columns[old_name]
            operations.alter_column(
                "addresses",
                old_name,
                new_column_name=new_name,
                existing_type=column["type"],
                existing_nullable=column["nullable"],
            )

        if add_address_line2:
            operations.add_column(
                "addresses",
                Column("address_line2", String(255), nullable=True),
            )


def _column_default_sql(column, dialect) -> str | None:
    """Return a literal SQL DEFAULT for a model column, or None."""
    from sqlalchemy import Boolean as SABoolean
    from sqlalchemy import DateTime as SADateTime

    if column.server_default is not None:
        arg = getattr(column.server_default, "arg", None)
        if isinstance(arg, str):
            return "'" + arg.replace("'", "''") + "'"
        if arg is not None:
            if dialect.name == "sqlite":
                return None  # SQLite cannot ADD COLUMN with a non-constant default
            try:
                compiled = str(
                    arg.compile(dialect=dialect, compile_kwargs={"literal_binds": True})
                )
            except Exception:
                return None
            if isinstance(column.type, SADateTime):
                return "CURRENT_TIMESTAMP"
            return compiled

    default = getattr(column.default, "arg", None) if column.default is not None else None
    if default is not None and not callable(default):
        if isinstance(default, bool) or isinstance(column.type, SABoolean):
            return "1" if default else "0"
        if isinstance(default, (int, float)):
            return str(default)
        if isinstance(default, str):
            return "'" + default.replace("'", "''") + "'"
    return None


def sync_missing_columns(engine: Engine) -> list[str]:
    """
    Add columns that exist in the SQLAlchemy models but not in an already
    existing table (for example a database created from an older
    auth_schema.sql). Nothing is ever dropped or modified.
    Returns a list of "table.column" names that were added.
    """
    from app.database.database import Base
    import app.database.base  # noqa: F401  (registers every model)

    added: list[str] = []
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    dialect = engine.dialect
    quote = dialect.identifier_preparer.quote

    with engine.begin() as connection:
        for table in Base.metadata.sorted_tables:
            if table.name not in existing_tables:
                continue
            present = {c["name"] for c in inspector.get_columns(table.name)}
            for column in table.columns:
                if column.name in present or column.primary_key:
                    continue
                column_type = column.type.compile(dialect=dialect)
                default_sql = _column_default_sql(column, dialect)
                parts = [quote(column.name), column_type]
                if column.nullable or default_sql is None:
                    parts.append("NULL")  # safe for rows that already exist
                else:
                    parts.append("NOT NULL")
                if default_sql is not None:
                    parts.append(f"DEFAULT {default_sql}")
                statement = f"ALTER TABLE {quote(table.name)} ADD COLUMN {' '.join(parts)}"
                connection.execute(text(statement))
                added.append(f"{table.name}.{column.name}")
    return added
