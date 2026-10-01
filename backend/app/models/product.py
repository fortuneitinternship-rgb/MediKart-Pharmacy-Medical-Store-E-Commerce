from sqlalchemy import Column, Float, Integer, String, Text

from app.database.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False, default="")
    price = Column(Float, nullable=False)
    rating = Column(Float, nullable=False, default=0)
    image = Column(String(1000), nullable=True)
    stock = Column(Integer, nullable=False, default=0)