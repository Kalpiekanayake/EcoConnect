from sqlalchemy import Column, Integer, String, Boolean, Float
from sqlalchemy.orm import relationship
from app.database import Base

class WasteCategory(Base):
    __tablename__ = "waste_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    is_sellable = Column(Boolean, default=False)
    unit = Column(String(50), nullable=True)  # e.g., "kg", "pieces"
    base_price_per_unit = Column(Float, default=0.0)

    # Relationships
    requests = relationship("PickupRequest", back_populates="category")
