from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..database import get_db
from ..models.models import Outlet, User
from ..schemas.schemas import OutletCreate, OutletUpdate, OutletResponse
from ..services.auth import get_current_user, require_roles

router = APIRouter(prefix="/api/outlets", tags=["Outlets"])

@router.get("", response_model=List[OutletResponse])
async def get_outlets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin_outlet" and current_user.assigned_outlet_id:
        result = await db.execute(
            select(Outlet).where(Outlet.id == current_user.assigned_outlet_id)
        )
    else:
        result = await db.execute(select(Outlet).order_by(Outlet.name))
    
    outlets = result.scalars().all()
    return [OutletResponse.model_validate(o) for o in outlets]

@router.get("/{outlet_id}", response_model=OutletResponse)
async def get_outlet(
    outlet_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Outlet).where(Outlet.id == outlet_id))
    outlet = result.scalar_one_or_none()
    
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
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["super_admin", "owner"]))
):
    outlet = Outlet(
        name=request.name,
        cogs_per_piece=request.cogs_per_piece
    )
    
    db.add(outlet)
    await db.commit()
    await db.refresh(outlet)
    
    return OutletResponse.model_validate(outlet)

@router.patch("/{outlet_id}", response_model=OutletResponse)
async def update_outlet(
    outlet_id: str,
    request: OutletUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["super_admin", "owner"]))
):
    result = await db.execute(select(Outlet).where(Outlet.id == outlet_id))
    outlet = result.scalar_one_or_none()
    
    if not outlet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outlet tidak ditemukan"
        )
    
    if request.name is not None:
        outlet.name = request.name
    if request.cogs_per_piece is not None:
        outlet.cogs_per_piece = request.cogs_per_piece
    
    await db.commit()
    await db.refresh(outlet)
    
    return OutletResponse.model_validate(outlet)

@router.delete("/{outlet_id}")
async def delete_outlet(
    outlet_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["super_admin", "owner"]))
):
    result = await db.execute(select(Outlet).where(Outlet.id == outlet_id))
    outlet = result.scalar_one_or_none()
    
    if not outlet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outlet tidak ditemukan"
        )
    
    await db.delete(outlet)
    await db.commit()
    
    return {"message": "Outlet berhasil dihapus"}
