from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.models import Outlet, User
from ..schemas.schemas import OutletCreate, OutletUpdate, OutletResponse
from ..services.auth import get_current_user, require_roles

router = APIRouter(prefix="/api/outlets", tags=["Outlets"])

@router.get("", response_model=List[OutletResponse])
async def get_outlets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin_outlet" and current_user.assigned_outlet_id:
        outlets = db.query(Outlet).filter(
            Outlet.id == current_user.assigned_outlet_id
        ).all()
    else:
        outlets = db.query(Outlet).order_by(Outlet.name).all()
    
    return [OutletResponse.model_validate(o) for o in outlets]

@router.get("/{outlet_id}", response_model=OutletResponse)
async def get_outlet(
    outlet_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    outlet = db.query(Outlet).filter(Outlet.id == outlet_id).first()
    
    if not outlet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outlet tidak ditemukan"
        )
    
    if current_user.role == "admin_outlet" and current_user.assigned_outlet_id != outlet_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki akses ke outlet ini"
        )
    
    return OutletResponse.model_validate(outlet)

@router.post("", response_model=OutletResponse)
async def create_outlet(
    request: OutletCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["super_admin", "owner"]))
):
    outlet = Outlet(
        name=request.name,
        cogs_per_piece=request.cogs_per_piece
    )
    
    db.add(outlet)
    db.commit()
    db.refresh(outlet)
    
    return OutletResponse.model_validate(outlet)

@router.patch("/{outlet_id}", response_model=OutletResponse)
async def update_outlet(
    outlet_id: str,
    request: OutletUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["super_admin", "owner"]))
):
    outlet = db.query(Outlet).filter(Outlet.id == outlet_id).first()
    
    if not outlet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outlet tidak ditemukan"
        )
    
    if request.name is not None:
        outlet.name = request.name
    if request.cogs_per_piece is not None:
        outlet.cogs_per_piece = request.cogs_per_piece
    
    db.commit()
    db.refresh(outlet)
    
    return OutletResponse.model_validate(outlet)

@router.delete("/{outlet_id}")
async def delete_outlet(
    outlet_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["super_admin", "owner"]))
):
    outlet = db.query(Outlet).filter(Outlet.id == outlet_id).first()
    
    if not outlet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outlet tidak ditemukan"
        )
    
    db.delete(outlet)
    db.commit()
    
    return {"message": "Outlet berhasil dihapus"}
