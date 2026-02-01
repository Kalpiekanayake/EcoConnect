from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# -------- Schema --------
class UserCreate(BaseModel):
    name: str
    email: str

# -------- Routes --------
@router.get("/")
def get_users():
    return {"message": "Get all users"}

@router.post("/")
def create_user(user: UserCreate):
    return {
        "message": "User created",
        "user": user
    }

@router.get("/{user_id}")
def get_user(user_id: int):
    return {"user_id": user_id}

@router.delete("/{user_id}")
def delete_user(user_id: int):
    return {"message": f"User {user_id} deleted"}
