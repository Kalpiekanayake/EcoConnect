from fastapi import APIRouter
from typing import List

from app.schemas.user import UserCreate, UserResponse

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

#  Dummy in-memory user list 
fake_users_db = []


#  GET all users
@router.get("/", response_model=List[UserResponse])
def get_users():
    return fake_users_db


# CREATE new user
@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate):
    new_user = {
        "id": len(fake_users_db) + 1,
        "name": user.name,
        "email": user.email
    }
    fake_users_db.append(new_user)
    return new_user
