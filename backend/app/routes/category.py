from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from fastapi import APIRouter


router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

# -------------------------------
# Create Category
# -------------------------------
@router.post("/", response_model=schemas.CategoryResponse)
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(models.Category).filter(
        models.Category.name == category.name
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")

    new_category = models.Category(name=category.name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category


# -------------------------------
# Get All Categories
# -------------------------------
@router.get("/", response_model=list[schemas.CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()
