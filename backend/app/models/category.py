from sqlalchemy import Boolean, Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database.database import Base

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100),nullable=False,unique=True)
    description = Column(Text, nullable=True)
    image = Column(String(500), nullable=True)
    is_active = Column(Boolean,default=True,nullable=False)
    products = relationship("Product",back_populates="category")