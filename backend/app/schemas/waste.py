from pydantic import BaseModel

class WasteCreate(BaseModel):
    name: str
    quantity: int
    location: str
    category_id: int


class WasteResponse(BaseModel):
    id: int
    name: str
    quantity: int
    location: str
    category_id: int

    class Config:
        from_attributes = True
