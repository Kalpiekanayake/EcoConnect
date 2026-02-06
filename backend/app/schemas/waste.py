from pydantic import BaseModel

class WasteCreate(BaseModel):
    title: str
    quantity: int
    price: float
    category_id: int

class WasteResponse(WasteCreate):
    id: int

    class Config:
        from_attributes = True
