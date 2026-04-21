from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models.waste import Waste
from app.schemas.waste import WasteCreate, WasteResponse
from app.routes.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/wastes",
    tags=["Wastes"]
)


# ✅ CREATE Waste (Protected)
@router.post("/", response_model=WasteResponse)
def create_waste(
    waste: WasteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_waste = Waste(**waste.dict() , user_id=current_user.id)
    db.add(new_waste)
    db.commit()
    db.refresh(new_waste)
    return new_waste


# ✅ GET All Wastes for Current User (Protected)
@router.get("/", response_model=list[WasteResponse])
def get_user_wastes(
    skip: int = 0,
    limit: int = 10,
    category_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Waste).filter(Waste.user_id == current_user.id)

    #  Filtering
    if category_id is not None:
        query = query.filter(Waste.category_id == category_id)

    #  Pagination
    wastes = query.offset(skip).limit(limit).all()

    return wastes



# ✅ UPDATE Waste (Protected)
@router.put("/{waste_id}", response_model=WasteResponse)
def update_waste(
    waste_id: int,
    updated_waste: WasteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    waste = db.query(Waste).filter(Waste.id == waste_id).first()

    
    if not waste:
        raise HTTPException(status_code=404, detail="Waste not found")
    
    if waste.user_id != current_user.id:
        raise HTTPException(status_code=403,detail="Not authorized")


    waste.title = updated_waste.title
    waste.description = updated_waste.description
    waste.category_id = updated_waste.category_id

    db.commit()
    db.refresh(waste)

    return waste


# ✅ DELETE Waste (Protected)
@router.delete("/{waste_id}")
def delete_waste(
    waste_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    waste = db.query(Waste).filter(Waste.id == waste_id).first()

    if not waste:
        raise HTTPException(status_code=404, detail="Waste not found")

    db.delete(waste)
    db.commit()

    return {"message": "Waste deleted successfully"}
