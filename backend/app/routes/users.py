from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.user import UserCreate, UserResponse
from app.models.user import User
from app.deps import get_db

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = User(
        full_name=user.full_name,
        email=user.email,
        phone_number=user.phone,
        default_address=user.address,
        role=user.role
    )
    # Password hashing should ideally happen here if we used password
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return UserResponse(
        id=new_user.id,
        full_name=new_user.full_name,
        email=new_user.email,
        phone=new_user.phone_number,
        address=new_user.default_address,
        role=new_user.role
    )

@router.get("/", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        UserResponse(
            id=u.id,
            full_name=u.full_name,
            email=u.email,
            phone=u.phone_number,
            address=u.default_address,
            role=u.role
        ) for u in users
    ]
