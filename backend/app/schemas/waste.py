from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.models.waste import WasteStatus

class WasteBase(BaseModel):
    description: Optional[str] = None
    quantity: float
    is_sellable: bool = False
    estimated_price: Optional[float] = None
    pickup_date: date
    time_slot: str
    address: Optional[str] = None
    category_id: int

class WasteCreate(WasteBase):
    pass

class WasteUpdate(BaseModel):
    status: Optional[WasteStatus] = None
    collector_id: Optional[int] = None

class WasteResponse(WasteBase):
    id: int
    status: WasteStatus
    household_id: int
    collector_id: Optional[int] = None

    class Config:
        from_attributes = True
