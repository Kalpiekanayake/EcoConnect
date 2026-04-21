from pydantic import BaseModel
from typing import Optional

class WasteCategoryCreate(BaseModel):
    name: str
    is_sellable: bool = False
    unit: Optional[str] = None
    base_price_per_unit: Optional[float] = None

class WasteCategoryResponse(WasteCategoryCreate):
    id: int

    class Config:
        from_attributes = True
