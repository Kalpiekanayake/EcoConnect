from pydantic import BaseModel
from typing import Optional

# ---------------------------
# CATEGORY SCHEMAS
# ---------------------------
class CategoryBase(BaseModel):
    name: str


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True


# ---------------------------
# WASTE SCHEMAS
# ---------------------------
class WasteBase(BaseModel):
    name: str
    quantity: int
    location: str
    category_id: int


class WasteCreate(WasteBase):
    pass


class WasteResponse(WasteBase):
    id: int

    class Config:
        from_attributes = True
