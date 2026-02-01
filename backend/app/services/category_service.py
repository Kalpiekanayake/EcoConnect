from sqlalchemy.orm import Session
from app.schemas.category import CategoryCreate
from app.models.category import Category

def create_category(db: Session, category: CategoryCreate):
    new_category = Category(
        name=category.name,
        description=category.description
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category
