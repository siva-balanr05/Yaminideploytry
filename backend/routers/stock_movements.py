"""
Stock Movement Routes
Delivery IN/OUT tracking for reception
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date, datetime

from database import get_db
from models import StockMovement, User, UserRole
from auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/stock-movements", tags=["stock-movements"])


# Schemas
class StockMovementCreate(BaseModel):
    movement_type: str  # IN or OUT
    item_name: str
    quantity: int
    reference: str | None = None


class StockMovementResponse(BaseModel):
    id: int
    movement_type: str
    item_name: str
    quantity: int
    reference: str | None
    status: str
    date: date
    logged_by: int
    approved_by: int | None
    created_at: datetime

    class Config:
        from_attributes = True


# Helper function to check reception role
def require_reception(current_user: User):
    if current_user.role not in [UserRole.RECEPTION, UserRole.ADMIN]:
        raise HTTPException(
            status_code=403, 
            detail="Only Reception or Admin can perform this action"
        )


@router.post("/", response_model=StockMovementResponse)
def log_stock_movement(
    movement_data: StockMovementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log delivery IN/OUT (Reception/Admin only)"""
    require_reception(current_user)
    
    if movement_data.movement_type not in ["IN", "OUT"]:
        raise HTTPException(status_code=400, detail="Movement type must be IN or OUT")
    
    movement = StockMovement(
        movement_type=movement_data.movement_type,
        item_name=movement_data.item_name,
        quantity=movement_data.quantity,
        reference=movement_data.reference,
        status="Pending",
        date=date.today(),
        logged_by=current_user.id
    )
    
    db.add(movement)
    db.commit()
    db.refresh(movement)
    
    return StockMovementResponse(
        id=movement.id,
        movement_type=movement.movement_type,
        item_name=movement.item_name,
        quantity=movement.quantity,
        reference=movement.reference,
        status=movement.status,
        date=movement.date,
        logged_by=movement.logged_by,
        approved_by=movement.approved_by,
        created_at=movement.created_at
    )


@router.get("/", response_model=List[StockMovementResponse])
def get_stock_movements(
    today: bool = False,
    status: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get stock movements (all, today, or filtered by status)"""
    if current_user.role not in [UserRole.RECEPTION, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = db.query(StockMovement)
    
    if today:
        query = query.filter(StockMovement.date == date.today())
    
    if status:
        query = query.filter(StockMovement.status == status)
    
    movements = query.order_by(StockMovement.created_at.desc()).all()
    
    return [
        StockMovementResponse(
            id=m.id,
            movement_type=m.movement_type,
            item_name=m.item_name,
            quantity=m.quantity,
            reference=m.reference,
            status=m.status,
            date=m.date,
            logged_by=m.logged_by,
            approved_by=m.approved_by,
            created_at=m.created_at
        )
        for m in movements
    ]


@router.put("/{movement_id}/approve")
def approve_stock_movement(
    movement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve stock movement (Admin only - Reception CANNOT do this)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, 
            detail="Only Admin can approve stock movements"
        )
    
    movement = db.query(StockMovement).filter(StockMovement.id == movement_id).first()
    
    if not movement:
        raise HTTPException(status_code=404, detail="Stock movement not found")
    
    movement.status = "Approved"
    movement.approved_by = current_user.id
    db.commit()
    
    return {"message": "Stock movement approved successfully"}


@router.delete("/{movement_id}")
def delete_stock_movement(
    movement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete stock movement (Admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only Admin can delete stock movements")
    
    movement = db.query(StockMovement).filter(StockMovement.id == movement_id).first()
    
    if not movement:
        raise HTTPException(status_code=404, detail="Stock movement not found")
    
    db.delete(movement)
    db.commit()
    
    return {"message": "Stock movement deleted successfully"}
