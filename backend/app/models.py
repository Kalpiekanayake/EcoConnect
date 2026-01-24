from sqlalchemy import Column, Integer, String
from app.database import Base

class WasteRequest(Base):
    __tablename__ = "waste_requests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    location = Column(String, nullable=False)
