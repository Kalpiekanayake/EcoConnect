from sqlalchemy.orm import Session
from app.schemas.category import WasteCategoryCreate
from app.models.category import WasteCategory

def create_category(db: Session, category: WasteCategoryCreate):
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

def get_categories(db: Session):
    return db.query(WasteCategory).all()
