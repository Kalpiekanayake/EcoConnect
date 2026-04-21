from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models.pickup_request import PickupRequest, PickupStatus
from app.schemas.waste import PickupRequestCreate, PickupRequestResponse
from app.routes.auth import get_current_user
from app.models.user import User, UserRole

router = APIRouter(
    prefix="/wastes",
    tags=["Wastes"]
)


# ✅ CREATE Pickup Request (Protected - Household)
@router.post("/", response_model=PickupRequestResponse)
def create_pickup_request(
    request: PickupRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.HOUSEHOLD:
        raise HTTPException(status_code=403, detail="Only households can create pickup requests")
        
    new_request = PickupRequest(**request.dict(), household_id=current_user.id)
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request


# ✅ GET All Pickup Requests (Public with filtering)
@router.get("/", response_model=list[PickupRequestResponse])
def get_pickup_requests(
    skip: int = 0,
    limit: int = 100,
    category_id: int | None = None,
    status: PickupStatus | None = None,
    household_id: int | None = None,
    collector_id: int | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(PickupRequest)

    if category_id is not None:
        query = query.filter(PickupRequest.category_id == category_id)
    
    if status is not None:
        query = query.filter(PickupRequest.status == status)

    if household_id is not None:
        query = query.filter(PickupRequest.household_id == household_id)
        
    if collector_id is not None:
        query = query.filter(PickupRequest.collector_id == collector_id)

    requests = query.offset(skip).limit(limit).all()
    return requests


# ✅ BOOK Pickup Request (Protected - Collector)
@router.patch("/{request_id}/book", response_model=PickupRequestResponse)
def book_pickup_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.COLLECTOR:
        raise HTTPException(status_code=403, detail="Only collectors can book pickups")
        
    request = db.query(PickupRequest).filter(PickupRequest.id == request_id).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Pickup request not found")
    
    if request.status != PickupStatus.OPEN:
        raise HTTPException(status_code=400, detail="Request is no longer open for booking")
        
    request.status = PickupStatus.BOOKED
    request.collector_id = current_user.id
    
    db.commit()
    db.refresh(request)
    return request


# ✅ UPDATE Pickup Request (Protected - Household Owner)
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
        raise HTTPException(status_code=403, detail="Not authorized to edit this request")

    if request.status != PickupStatus.OPEN:
        raise HTTPException(status_code=400, detail="Cannot edit a request that is already booked or collected")

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


# ✅ DELETE Pickup Request (Protected - Household Owner)
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
        raise HTTPException(status_code=403, detail="Not authorized to delete this request")

    db.delete(request)
    db.commit()

    return {"message": "Pickup request deleted successfully"}
