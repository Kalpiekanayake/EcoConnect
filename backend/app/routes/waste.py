from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.deps import get_db 
from app.models.waste import Waste
from app.schemas.waste import WasteCreate, WasteResponse

router = APIRouter(
    prefix="/wastes",
    tags=["Wastes"]
)

@router.post("/", response_model=WasteResponse)
def create_waste(waste: WasteCreate, db: Session = Depends(get_db)):
    new_waste = Waste(**waste.dict())
    db.add(new_waste)
    db.commit()
    db.refresh(new_waste)
    return new_waste

@router.get("/", response_model=list[WasteResponse])
def get_all_wastes(db: Session = Depends(get_db)):
    return db.query(Waste).all()

@router.get("/", operation_id="wastes_get_all")
def get_all_wastes():
    return {"message": "All wastes"}

@router.post("/", operation_id="wastes_create")
def create_waste(waste: WasteCreate):
    return {"message": "Waste created"}


@router.put("/{waste_id}")
def update_waste(waste_id: int, updated_waste:WasteCreate, db: Session = Depends(get_db)):
    waste = db.query(models.Waste).filter(models.Waste.id == waste_id).first()

    if not waste:
        raise HTTPException(status_code=404, detail="Waste not found")

    waste.title = updated_waste.title
    waste.description = updated_waste.description
    waste.category_id = updated_waste.category_id

    db.commit()
    db.refresh(waste)

    return waste


@router.delete("/{waste_id}")
def delete_waste(waste_id: int, db: Session = Depends(get_db)):
    waste = db.query(models.Waste).filter(models.Waste.id == waste_id).first()

    if not waste:
        raise HTTPException(status_code=404, detail="Waste not found")

    db.delete(waste)
    db.commit()

    return {"message": "Waste deleted successfully"}
