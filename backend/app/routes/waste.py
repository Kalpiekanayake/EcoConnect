from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/waste", tags=["Waste Requests"])

@router.post("/")
def create_waste_request(
    request: schemas.WasteRequestCreate,
    db: Session = Depends(get_db)
):
    new_request = models.WasteRequest(
        name=request.name,
        quantity=request.quantity,
        location=request.location
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return {
        "message": "Waste request created successfully",
        "data": new_request
    }
