from sqlalchemy import Column, Integer, String
from .database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    image_url = Column(String)


class WasteItem(Base):
    __tablename__ = "waste_items"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer)
    seller_name = Column(String)
    quantity = Column(Integer)
    price = Column(Integer)
    location = Column(String)
