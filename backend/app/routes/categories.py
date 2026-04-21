from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models.category import WasteCategory
from app.schemas.category import WasteCategoryCreate, WasteCategoryResponse

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

@router.post("/", response_model=WasteCategoryResponse)
def create_category(category: WasteCategoryCreate, db: Session = Depends(get_db)):
    new_category = WasteCategory(
        name=category.name,
        is_sellable=category.is_sellable,
        unit=category.unit,
        base_price_per_unit=category.base_price_per_unit
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

@router.get("/", response_model=list[WasteCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(WasteCategory).all()
