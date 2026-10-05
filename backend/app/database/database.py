from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings


# ============================================================
# DATABASE ENGINE
# ============================================================

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=280,
    echo=False,
    connect_args={
        "check_same_thread": False
    }
    if settings.DATABASE_URL.startswith("sqlite")
    else {},
)


# ============================================================
# DATABASE SESSION
# ============================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ============================================================
# BASE MODEL
# ============================================================

Base = declarative_base()


# ============================================================
# DATABASE DEPENDENCY
# ============================================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ============================================================
# DATABASE SCHEMA COMPATIBILITY
# ============================================================

def ensure_schema_compatibility():

    inspector = inspect(engine)

    table_names = set(
        inspector.get_table_names()
    )

    # ========================================================
    # USERS TABLE
    # ========================================================

    if "users" in table_names:

        user_columns = {
            column["name"]
            for column in inspector.get_columns("users")
        }

        user_indexes = {
            index["name"]
            for index in inspector.get_indexes("users")
        }

        with engine.begin() as connection:

            # -----------------------------------------------
            # is_admin
            # -----------------------------------------------

            if "is_admin" not in user_columns:

                connection.execute(
                    text(
                        """
                        ALTER TABLE users
                        ADD COLUMN is_admin
                        BOOLEAN NOT NULL DEFAULT FALSE
                        """
                    )
                )

            # -----------------------------------------------
            # profile_image
            # -----------------------------------------------

            if "profile_image" not in user_columns:

                connection.execute(
                    text(
                        """
                        ALTER TABLE users
                        ADD COLUMN profile_image
                        VARCHAR(2048) NULL
                        """
                    )
                )

            # -----------------------------------------------
            # updated_at
            # -----------------------------------------------

            if "updated_at" not in user_columns:

                connection.execute(
                    text(
                        """
                        ALTER TABLE users
                        ADD COLUMN updated_at
                        DATETIME NULL
                        """
                    )
                )

                connection.execute(
                    text(
                        """
                        UPDATE users
                        SET updated_at =
                            COALESCE(
                                created_at,
                                CURRENT_TIMESTAMP
                            )
                        WHERE updated_at IS NULL
                        """
                    )
                )

            # -----------------------------------------------
            # UNIQUE PHONE INDEX
            # -----------------------------------------------

            if (
                "phone" in user_columns
                and "uq_users_phone" not in user_indexes
            ):

                duplicate_phones = connection.execute(
                    text(
                        """
                        SELECT COUNT(*)
                        FROM (
                            SELECT phone
                            FROM users
                            WHERE phone IS NOT NULL
                            GROUP BY phone
                            HAVING COUNT(*) > 1
                        ) duplicate_phones
                        """
                    )
                ).scalar_one()

                if duplicate_phones:

                    raise RuntimeError(
                        "Cannot create unique phone index. "
                        "Duplicate phone numbers exist in users."
                    )

                connection.execute(
                    text(
                        """
                        CREATE UNIQUE INDEX
                        uq_users_phone
                        ON users (phone)
                        """
                    )
                )

    # ========================================================
    # CATEGORIES TABLE
    # ========================================================

    if "categories" not in table_names:

        with engine.begin() as connection:

            connection.execute(
                text(
                    """
                    CREATE TABLE categories (

                        id INT NOT NULL AUTO_INCREMENT,

                        name VARCHAR(100) NOT NULL,

                        description TEXT NULL,

                        image VARCHAR(500) NULL,

                        is_active BOOLEAN
                            NOT NULL DEFAULT TRUE,

                        created_at DATETIME
                            NOT NULL DEFAULT CURRENT_TIMESTAMP,

                        PRIMARY KEY (id),

                        UNIQUE KEY
                            uq_categories_name (name)

                    ) ENGINE=InnoDB
                    """
                )
            )

    # ========================================================
    # PRODUCTS TABLE
    # ========================================================

    if "products" not in table_names:

        with engine.begin() as connection:

            connection.execute(
                text(
                    """
                    CREATE TABLE products (

                        id INT NOT NULL AUTO_INCREMENT,

                        name VARCHAR(255) NOT NULL,

                        description TEXT NULL,

                        price DECIMAL(10,2) NOT NULL,

                        discount_price DECIMAL(10,2) NULL,

                        stock INT NOT NULL DEFAULT 0,

                        category_id INT NOT NULL,

                        image VARCHAR(500) NULL,

                        rating DECIMAL(3,2)
                            NOT NULL DEFAULT 0.00,

                        is_active BOOLEAN
                            NOT NULL DEFAULT TRUE,

                        is_featured BOOLEAN
                            NOT NULL DEFAULT FALSE,

                        is_trending BOOLEAN
                            NOT NULL DEFAULT FALSE,

                        is_flash_sale BOOLEAN
                            NOT NULL DEFAULT FALSE,

                        flash_sale_start DATETIME NULL,

                        flash_sale_end DATETIME NULL,

                        created_at DATETIME
                            NOT NULL DEFAULT CURRENT_TIMESTAMP,

                        updated_at DATETIME
                            NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,

                        PRIMARY KEY (id),

                        UNIQUE KEY
                            uq_products_name (name),

                        KEY
                            ix_products_category_id
                            (category_id),

                        KEY
                            ix_products_active
                            (is_active),

                        KEY
                            ix_products_featured
                            (is_featured),

                        KEY
                            ix_products_trending
                            (is_trending),

                        KEY
                            ix_products_flash_sale
                            (is_flash_sale),

                        CONSTRAINT
                            fk_products_category
                            FOREIGN KEY (category_id)
                            REFERENCES categories(id)
                            ON DELETE CASCADE
                            ON UPDATE CASCADE

                    ) ENGINE=InnoDB
                    """
                )
            )

    # ========================================================
    # PRODUCT IMAGES TABLE
    # ========================================================

    if "product_images" not in table_names:

        with engine.begin() as connection:

            connection.execute(
                text(
                    """
                    CREATE TABLE product_images (

                        id INT NOT NULL AUTO_INCREMENT,

                        product_id INT NOT NULL,

                        image_url VARCHAR(500) NOT NULL,

                        is_primary BOOLEAN
                            NOT NULL DEFAULT FALSE,

                        sort_order INT
                            NOT NULL DEFAULT 0,

                        created_at DATETIME
                            NOT NULL DEFAULT CURRENT_TIMESTAMP,

                        PRIMARY KEY (id),

                        KEY
                            ix_product_images_product_id
                            (product_id),

                        CONSTRAINT
                            fk_product_images_product
                            FOREIGN KEY (product_id)
                            REFERENCES products(id)
                            ON DELETE CASCADE
                            ON UPDATE CASCADE

                    ) ENGINE=InnoDB
                    """
                )
            )

    # ========================================================
    # REFRESH INSPECTOR
    # ========================================================

    # IMPORTANT:
    # We created/changed tables above.
    # Therefore we MUST inspect the database again.

    inspector = inspect(engine)

    # ========================================================
    # FIX EXISTING PRODUCTS TABLE
    # ========================================================

    if "products" in inspector.get_table_names():

        product_columns = {
            column["name"]
            for column in inspector.get_columns("products")
        }

        with engine.begin() as connection:

            # -----------------------------------------------
            # discount_price
            # -----------------------------------------------

            if "discount_price" not in product_columns:

                connection.execute(
                    text(
                        """
                        ALTER TABLE products
                        ADD COLUMN discount_price
                        DECIMAL(10,2) NULL
                        """
                    )
                )

            # -----------------------------------------------
            # image
            # -----------------------------------------------

            if "image" not in product_columns:

                connection.execute(
                    text(
                        """
                        ALTER TABLE products
                        ADD COLUMN image
                        VARCHAR(500) NULL
                        """
                    )
                )

            # -----------------------------------------------
            # rating
            # -----------------------------------------------

            if "rating" not in product_columns:

                connection.execute(
                    text(
                        """
                        ALTER TABLE products
                        ADD COLUMN rating
                        DECIMAL(3,2)
                        NOT NULL DEFAULT 0.00
                        """
                    )
                )

            # -----------------------------------------------
            # is_active
            # -----------------------------------------------

            if "is_active" not in product_columns:

                connection.execute(
                    text(
                        """
                        ALTER TABLE products
                        ADD COLUMN is_active
                        BOOLEAN NOT NULL DEFAULT TRUE
                        """
                    )
                )

            # -----------------------------------------------
            # is_featured
            # -----------------------------------------------

            if "is_featured" not in product_columns:

                connection.execute(
                    text(
                        """
                        ALTER TABLE products
                        ADD COLUMN is_featured
                        BOOLEAN NOT NULL DEFAULT FALSE
                        """
                    )
                )

            # -----------------------------------------------
            # is_trending
            # -----------------------------------------------

            if "is_trending" not in product_columns:

                connection.execute(
                    text(
                        """
                        ALTER TABLE products
                        ADD COLUMN is_trending
                        BOOLEAN NOT NULL DEFAULT FALSE
                        """
                    )
                )

            # -----------------------------------------------
            # is_flash_sale
            # -----------------------------------------------

            if "is_flash_sale" not in product_columns:

                connection.execute(
                    text(
                        """
                        ALTER TABLE products
                        ADD COLUMN is_flash_sale
                        BOOLEAN NOT NULL DEFAULT FALSE
                        """
                    )
                )

            # -----------------------------------------------
            # flash_sale_start
            # -----------------------------------------------

            if "flash_sale_start" not in product_columns:

                connection.execute(
                    text(
                        """
                        ALTER TABLE products
                        ADD COLUMN flash_sale_start
                        DATETIME NULL
                        """
                    )
                )

            # -----------------------------------------------
            # flash_sale_end
            # -----------------------------------------------

            if "flash_sale_end" not in product_columns:

                connection.execute(
                    text(
                        """
                        ALTER TABLE products
                        ADD COLUMN flash_sale_end
                        DATETIME NULL
                        """
                    )
                )

            # -----------------------------------------------
            # updated_at
            # -----------------------------------------------

            if "updated_at" not in product_columns:

                connection.execute(
                    text(
                        """
                        ALTER TABLE products
                        ADD COLUMN updated_at
                        DATETIME NULL
                        """
                    )
                )

    # ========================================================
    # REFRESH PRODUCT COLUMNS
    # ========================================================

    inspector = inspect(engine)

    if "products" in inspector.get_table_names():

        product_columns = {
            column["name"]
            for column in inspector.get_columns("products")
        }

        product_indexes = {
            index["name"]
            for index in inspector.get_indexes("products")
        }

        with engine.begin() as connection:

            # -----------------------------------------------
            # Active index
            # -----------------------------------------------

            if (
                "is_active" in product_columns
                and "ix_products_active" not in product_indexes
            ):

                connection.execute(
                    text(
                        """
                        CREATE INDEX
                        ix_products_active
                        ON products (is_active)
                        """
                    )
                )

            # -----------------------------------------------
            # Featured index
            # -----------------------------------------------

            if (
                "is_featured" in product_columns
                and "ix_products_featured" not in product_indexes
            ):

                connection.execute(
                    text(
                        """
                        CREATE INDEX
                        ix_products_featured
                        ON products (is_featured)
                        """
                    )
                )

            # -----------------------------------------------
            # Trending index
            # -----------------------------------------------

            if (
                "is_trending" in product_columns
                and "ix_products_trending" not in product_indexes
            ):

                connection.execute(
                    text(
                        """
                        CREATE INDEX
                        ix_products_trending
                        ON products (is_trending)
                        """
                    )
                )

            # -----------------------------------------------
            # Flash sale index
            # -----------------------------------------------

            if (
                "is_flash_sale" in product_columns
                and "ix_products_flash_sale"
                not in product_indexes
            ):

                connection.execute(
                    text(
                        """
                        CREATE INDEX
                        ix_products_flash_sale
                        ON products (is_flash_sale)
                        """
                    )
                )

    # ========================================================
    # FINAL MESSAGE
    # ========================================================

    print(
        "MediKart database schema compatibility check completed."
    )