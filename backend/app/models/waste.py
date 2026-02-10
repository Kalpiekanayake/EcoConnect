from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database import Base

class Waste(Base):
    __tablename__ = "wastes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)   
    description = Column(String(500))
    category_id = Column(Integer, ForeignKey("categories.id"))
    