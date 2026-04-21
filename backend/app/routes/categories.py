from fastapi import APIRouter, Depends, HTTPException
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

# ✅ SEED Categories (Helpful for fresh databases)
@router.post("/seed")
def seed_categories(db: Session = Depends(get_db)):
    existing = db.query(WasteCategory).first()
    if existing:
        return {"message": "Categories already exist"}
        
    default_categories = [
        {"name": "Coconut Shells", "is_sellable": True, "unit": "kg", "base_price_per_unit": 0.5},
        {"name": "Plastic Bottles", "is_sellable": True, "unit": "kg", "base_price_per_unit": 0.2},
        {"name": "Glass", "is_sellable": True, "unit": "kg", "base_price_per_unit": 0.1},
        {"name": "Paper/Cardboard", "is_sellable": True, "unit": "kg", "base_price_per_unit": 0.3},
        {"name": "Food Waste", "is_sellable": False, "unit": "kg", "base_price_per_unit": 0},
        {"name": "General Disposal", "is_sellable": False, "unit": "kg", "base_price_per_unit": 0},
    ]
    
    for cat_data in default_categories:
        cat = WasteCategory(**cat_data)
        db.add(cat)
    
    db.commit()
    return {"message": "Default categories created successfully"}
