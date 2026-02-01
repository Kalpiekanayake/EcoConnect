from fastapi import APIRouter
from app.schemas import WasteCreate, WasteResponse

router = APIRouter(
    prefix="/waste",
    tags=["Waste"]
)

@router.post("/", response_model=WasteResponse)
def create_waste(waste: WasteCreate):
    return {
        "id": 1,
        "name": waste.name,
        "price": waste.price
    }
