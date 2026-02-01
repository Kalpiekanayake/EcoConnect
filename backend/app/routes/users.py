from fastapi import APIRouter
from app.schemas.user import UserResponse

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/", response_model=list[UserResponse])
def get_users():
    return [
        {"id": 1, "name": "Kalpani", "email": "kalpani@gmail.com"}
    ]
