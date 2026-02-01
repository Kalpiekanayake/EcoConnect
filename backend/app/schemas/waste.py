from pydantic import BaseModel

class WasteCreate(BaseModel):
    name: str
    price: float

class WasteResponse(BaseModel):
    id: int
    name: str
    price: float
