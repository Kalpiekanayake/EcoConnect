from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.models.pickup_request import PickupStatus

class PickupRequestBase(BaseModel):
    description: Optional[str] = None
    quantity: float
    is_sellable: bool = False
    estimated_price: Optional[float] = None
    pickup_date: date
    time_slot: str
    address_line: str
    category_id: int

class PickupRequestCreate(PickupRequestBase):
    pass

class PickupRequestUpdate(BaseModel):
    status: Optional[PickupStatus] = None
    collector_id: Optional[int] = None

class PickupRequestResponse(PickupRequestBase):
    id: int
    status: PickupStatus
    household_id: int
    collector_id: Optional[int] = None

    class Config:
        from_attributes = True
