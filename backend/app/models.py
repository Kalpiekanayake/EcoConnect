from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    wastes = relationship("Waste", back_populates="category")


class Waste(Base):
    __tablename__ = "wastes"

    id = Column(Integer, primary_key=True, index=True)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    location = Column(String, nullable=False)

    category_id = Column(Integer, ForeignKey("categories.id"))

    category = relationship("Category", back_populates="wastes")
