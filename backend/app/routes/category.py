from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import schemas
from app.services import category_service

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


@router.post("/", response_model=schemas.CategoryResponse)
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db)
):
    result = category_service.create_category(db, category)

    if not result:
        raise HTTPException(status_code=400, detail="Category already exists")

    return result


@router.get("/", response_model=list[schemas.CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return category_service.get_all_categories(db)
