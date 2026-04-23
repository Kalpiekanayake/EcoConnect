from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.deps import get_db
from app.models.category import WasteCategory
from app.models.pickup_request import PickupRequest # Import to handle migration
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

@router.get("/", response_model=List[WasteCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(WasteCategory).all()

# ✅ Force Reset: Standardizes Categories and handles Foreign Key constraints
@router.post("/seed")
def seed_categories(db: Session = Depends(get_db)):
    required_categories = [
        {"name": "Coconut Shells", "is_sellable": True, "unit": "pieces", "base_price_per_unit": 5.0},
        {"name": "Coconut Husks", "is_sellable": True, "unit": "pieces", "base_price_per_unit": 3.0},
        {"name": "Plastic", "is_sellable": True, "unit": "kg", "base_price_per_unit": 20.0},
        {"name": "Glass", "is_sellable": True, "unit": "kg", "base_price_per_unit": 15.0},
        {"name": "Paper/Cardboard", "is_sellable": True, "unit": "kg", "base_price_per_unit": 10.0},
        {"name": "Food Waste", "is_sellable": False, "unit": "kg", "base_price_per_unit": 0},
        {"name": "General Disposal", "is_sellable": False, "unit": "items", "base_price_per_unit": 0},
    ]

    try:
        # 1. First, ensure the required ones exist or are updated
        # We need the ID of 'General Disposal' for the migration step
        general_disposal_id = None
        
        for cat_data in required_categories:
            existing = db.query(WasteCategory).filter(WasteCategory.name == cat_data["name"]).first()
            if existing:
                existing.is_sellable = cat_data["is_sellable"]
                existing.unit = cat_data["unit"]
                existing.base_price_per_unit = cat_data["base_price_per_unit"]
                db.flush()
                if existing.name == "General Disposal":
                    general_disposal_id = existing.id
            else:
                new_cat = WasteCategory(**cat_data)
                db.add(new_cat)
                db.flush()
                if new_cat.name == "General Disposal":
                    general_disposal_id = new_cat.id

        # 2. Identify all categories that are NOT in the required list
        required_names = [c["name"] for c in required_categories]
        to_delete = db.query(WasteCategory).filter(~WasteCategory.name.in_(required_names)).all()
        to_delete_ids = [c.id for c in to_delete]

        # 3. MIGRATION: Move requests from old categories to 'General Disposal' 
        # to prevent Foreign Key errors
        if to_delete_ids and general_disposal_id:
            db.query(PickupRequest).filter(PickupRequest.category_id.in_(to_delete_ids)).update(
                {PickupRequest.category_id: general_disposal_id},
                synchronize_session=False
            )

        # 4. Now safely delete the old categories
        if to_delete_ids:
            db.query(WasteCategory).filter(WasteCategory.id.in_(to_delete_ids)).delete(synchronize_session=False)

        db.commit()
        return {"message": "System standardized: Existing requests moved to 'General Disposal', old categories removed."}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Reset failed. Error: {str(e)}"
        )
