from fastapi import APIRouter
from app.schemas import CategoryCreate, CategoryResponse

router = APIRouter(
    prefix="/category",
    tags=["Category"]
)

@router.post("/", response_model=CategoryResponse)
def create_category(category: CategoryCreate):
    return {
        "id": 1,
        "name": category.name
    }
