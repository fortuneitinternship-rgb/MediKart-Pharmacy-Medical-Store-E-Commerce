from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import Boolean, Column, Engine, Float, Integer, String, inspect, text


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
                    server_default="false",
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
