from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/waste",
    tags=["Waste"]
)

# ---------------- CREATE WASTE ----------------
@router.post("/", response_model=schemas.WasteResponse)
def create_waste(waste: schemas.WasteCreate, db: Session = Depends(get_db)):

    # check category exists
    category = db.query(models.Category).filter(
        models.Category.id == waste.category_id
    ).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    new_waste = models.Waste(
        category_id=waste.category_id,
        quantity=waste.quantity,
        price=waste.price,
        location=waste.location
    )

    db.add(new_waste)
    db.commit()
    db.refresh(new_waste)

    return new_waste


# ---------------- GET WASTE BY CATEGORY ----------------
@router.get("/by-category/{category_id}", response_model=list[schemas.WasteResponse])
def get_waste_by_category(category_id: int, db: Session = Depends(get_db)):

    wastes = db.query(models.Waste).filter(
        models.Waste.category_id == category_id
    ).all()

    return wastes
