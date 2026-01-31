from sqlalchemy.orm import Session
from app import models, schemas


def create_category(db: Session, category: schemas.CategoryCreate):
    # check duplicate
    existing = db.query(models.Category).filter(
        models.Category.name == category.name
    ).first()

    if existing:
        return None

    new_category = models.Category(
        name=category.name
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


def get_all_categories(db: Session):
    return db.query(models.Category).all()
