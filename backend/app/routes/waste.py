from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models.pickup_request import PickupRequest
from app.schemas.waste import PickupRequestCreate, PickupRequestResponse
from app.routes.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/wastes",
    tags=["Wastes"]
)


# ✅ CREATE Pickup Request (Protected)
@router.post("/", response_model=PickupRequestResponse)
def create_pickup_request(
    request: PickupRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_request = PickupRequest(**request.dict(), household_id=current_user.id)
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request


# ✅ GET All Pickup Requests for Current User (Protected)
@router.get("/", response_model=list[PickupRequestResponse])
def get_user_pickup_requests(
    skip: int = 0,
    limit: int = 10,
    category_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(PickupRequest).filter(PickupRequest.household_id == current_user.id)

    #  Filtering
    if category_id is not None:
        query = query.filter(PickupRequest.category_id == category_id)

    #  Pagination
    requests = query.offset(skip).limit(limit).all()

    return requests



# ✅ UPDATE Pickup Request (Protected)
@router.put("/{request_id}", response_model=PickupRequestResponse)
def update_pickup_request(
    request_id: int,
    updated_request: PickupRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    request = db.query(PickupRequest).filter(PickupRequest.id == request_id).first()

    
    if not request:
        raise HTTPException(status_code=404, detail="Pickup request not found")
    
    if request.household_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")


    request.description = updated_request.description
    request.quantity = updated_request.quantity
    request.is_sellable = updated_request.is_sellable
    request.estimated_price = updated_request.estimated_price
    request.pickup_date = updated_request.pickup_date
    request.time_slot = updated_request.time_slot
    request.address_line = updated_request.address_line
    request.category_id = updated_request.category_id

    db.commit()
    db.refresh(request)

    return request


# ✅ DELETE Pickup Request (Protected)
@router.delete("/{request_id}")
def delete_pickup_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    request = db.query(PickupRequest).filter(PickupRequest.id == request_id).first()

    if not request:
        raise HTTPException(status_code=404, detail="Pickup request not found")

    if request.household_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(request)
    db.commit()

    return {"message": "Pickup request deleted successfully"}
