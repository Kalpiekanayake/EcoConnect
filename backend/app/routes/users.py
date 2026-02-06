from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# -------- In-memory storage --------
users_db = []

# -------- Schema --------
class UserCreate(BaseModel):
    name: str
    email: str

# -------- Routes --------
@router.get("/users")
def get_users():
    return users_db

@router.post("/users")
def create_user(user: UserCreate):
    new_user = {
        "id": len(users_db) + 1,
        "name": user.name,
        "email": user.email
    }
    users_db.append(new_user)
    return new_user
