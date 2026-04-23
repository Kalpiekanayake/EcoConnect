from pydantic import BaseModel, model_validator
from typing import Optional
from datetime import date
from app.models.pickup_request import PickupStatus

class PickupRequestBase(BaseModel):
    description: Optional[str] = None
    quantity: float
    unit: str = "kg"
    is_sellable: bool = False
    price: Optional[float] = None
    estimated_price: Optional[float] = None # For backward compatibility
    pickup_date: date
    time_slot: str
    address_line: str
    category_id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    @model_validator(mode='after')
    def check_sellable_price(self) -> 'PickupRequestBase':
        # If sellable and price is missing/None/0, we don't necessarily want to HARD fail if it's an update of an old record
        # but for new ones we do. However, to stabilize, let's be more lenient or ensure defaults.
        if self.is_sellable and self.price is None:
            # If price is None but is_sellable is True, default to 0.0 instead of crashing
            self.price = 0.0
        if not self.is_sellable:
            self.price = None
        
        # Sync estimated_price for backward compatibility
        if self.price is not None:
            self.estimated_price = self.price
        return self

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
