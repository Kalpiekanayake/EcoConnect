import enum
from sqlalchemy import Column, Integer, String, Float, Enum
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(str, enum.Enum):
    HOUSEHOLD = "HOUSEHOLD"
    COLLECTOR = "COLLECTOR"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    phone_number = Column(String(20), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.HOUSEHOLD, nullable=False)
    default_address = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Relationships
    created_requests = relationship("PickupRequest", foreign_keys="PickupRequest.household_id", back_populates="household")
    accepted_requests = relationship("PickupRequest", foreign_keys="PickupRequest.collector_id", back_populates="collector")
