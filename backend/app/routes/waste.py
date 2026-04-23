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


# ✅ CREATE Pickup Request (HOUSEHOLD only)
@router.post("/", response_model=PickupRequestResponse)
def create_pickup_request(
    request: PickupRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.HOUSEHOLD:
        raise HTTPException(status_code=403, detail="Only Households can create pickup requests")
        
    new_request = PickupRequest(**request.model_dump(), household_id=current_user.id)
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request


# ✅ GET Pickup Requests (Dynamic Permissions)
@router.get("/", response_model=list[PickupRequestResponse])
def get_pickup_requests(
    skip: int = 0,
    limit: int = 100,
    category_id: int | None = None,
    status: PickupStatus | None = None,
    household_id: int | None = None,
    collector_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(PickupRequest)

    # HOUSEHOLD: Only see their own requests
    if current_user.role == UserRole.HOUSEHOLD:
        query = query.filter(PickupRequest.household_id == current_user.id)
    
    # COLLECTOR: Filter based on provided params (e.g., status=OPEN or collector_id=ME)
    elif current_user.role == UserRole.COLLECTOR:
        if status:
            query = query.filter(PickupRequest.status == status)
        if collector_id:
            query = query.filter(PickupRequest.collector_id == collector_id)
        # If no status filter, default to showing them everything they might care about (OPEN or assigned to them)
        if not status and not collector_id:
             query = query.filter((PickupRequest.status == PickupStatus.OPEN) | (PickupRequest.collector_id == current_user.id))

    if category_id is not None:
        query = query.filter(PickupRequest.category_id == category_id)

    requests = query.offset(skip).limit(limit).all()
    return requests


# ✅ BOOK Pickup Request (COLLECTOR only)
@router.patch("/{request_id}/book", response_model=PickupRequestResponse)
def book_pickup_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.COLLECTOR:
        raise HTTPException(status_code=403, detail="Only Collectors can book pickups")
        
    request = db.query(PickupRequest).filter(PickupRequest.id == request_id).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Pickup request not found")
    
    if request.status != PickupStatus.OPEN:
        raise HTTPException(status_code=400, detail="Request is already booked or collected")
        
    request.status = PickupStatus.BOOKED
    request.collector_id = current_user.id
    
    db.commit()
    db.refresh(request)
    return request


# ✅ MARK AS COLLECTED (COLLECTOR only, Must be assigned)
@router.patch("/{request_id}/collect", response_model=PickupRequestResponse)
def collect_pickup_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.COLLECTOR:
        raise HTTPException(status_code=403, detail="Only Collectors can update collection status")
        
    request = db.query(PickupRequest).filter(PickupRequest.id == request_id).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Pickup request not found")
    
    if request.collector_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not assigned to this pickup")
        
    if request.status != PickupStatus.BOOKED:
        raise HTTPException(status_code=400, detail="Only booked requests can be marked as collected")
        
    request.status = PickupStatus.COLLECTED
    
    db.commit()
    db.refresh(request)
    return request


# ✅ GET Single Request (HOUSEHOLD owner or any COLLECTOR)
@router.get("/{request_id}", response_model=PickupRequestResponse)
def get_pickup_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    request = db.query(PickupRequest).filter(PickupRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Pickup request not found")
    
    # Households can only see their own
    if current_user.role == UserRole.HOUSEHOLD and request.household_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this request")
        
    return request


# ✅ UPDATE Pickup Request (HOUSEHOLD owner only, Status must be OPEN)
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
    request.unit = updated_request.unit
    request.is_sellable = updated_request.is_sellable
    request.price = updated_request.price
    request.estimated_price = updated_request.estimated_price
    request.pickup_date = updated_request.pickup_date
    request.time_slot = updated_request.time_slot
    request.address_line = updated_request.address_line
    request.category_id = updated_request.category_id
    request.latitude = updated_request.latitude
    request.longitude = updated_request.longitude

    db.commit()
    db.refresh(request)
    return request


# ✅ DELETE Pickup Request (HOUSEHOLD owner only, Status must be OPEN)
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
    
    if request.status != PickupStatus.OPEN:
        raise HTTPException(status_code=400, detail="Cannot delete a request that is already booked or collected")

    db.delete(request)
    db.commit()

    return {"message": "Pickup request deleted successfully"}
