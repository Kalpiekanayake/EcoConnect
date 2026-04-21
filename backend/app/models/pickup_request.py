import enum
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Date, DateTime, Enum, func
from sqlalchemy.orm import relationship
from app.database import Base

class PickupStatus(str, enum.Enum):
    OPEN = "OPEN"
    BOOKED = "BOOKED"
    COLLECTED = "COLLECTED"
    CANCELLED = "CANCELLED"

class PickupRequest(Base):
    __tablename__ = "pickup_requests"

    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    household_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    collector_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("waste_categories.id"), nullable=False)

    # Details
    description = Column(String(500), nullable=True)
    quantity = Column(Float, nullable=False)
    is_sellable = Column(Boolean, default=False)
    estimated_price = Column(Float, nullable=True)
    
    # Scheduling
    pickup_date = Column(Date, nullable=False)
    time_slot = Column(String(100), nullable=False)
    
    # Status & Location
    status = Column(Enum(PickupStatus), default=PickupStatus.OPEN, nullable=False)
    address_line = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    household = relationship("User", foreign_keys=[household_id], back_populates="created_requests")
    collector = relationship("User", foreign_keys=[collector_id], back_populates="accepted_requests")
    category = relationship("WasteCategory", back_populates="requests")
