


from pydantic import BaseModel

class WasteRequestCreate(BaseModel):
    name: str
    quantity: int
    location: str
