from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import Column, Engine, String, inspect


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
