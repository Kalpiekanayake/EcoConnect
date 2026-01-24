from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(
    prefix="/houses",
    tags=["Houses"]
)

class CoconutPost(BaseModel):
    owner_name: str
    location: str
    quantity_kg: int
    available_date: str

@router.post("/post-coconut")
def post_coconut(data: CoconutPost):
    return {
        "message": "Coconut availability posted successfully",
        "data": data
    }
