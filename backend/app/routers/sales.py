from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from ..database import get_db
from ..models.models import Sale, Outlet, User
from ..schemas.schemas import SaleCreate, SaleUpdate, SaleResponse
from ..services.auth import get_current_user

router = APIRouter(prefix="/api/sales", tags=["Sales"])

def calculate_sale_metrics(sale: Sale, cogs_per_piece: float, outlet_name: str = None) -> dict:
    total_revenue = sale.cash + sale.qris + sale.grab + sale.gofood + sale.shopee + sale.tiktok
    cogs_sold = sale.total_sold * cogs_per_piece
    gross_margin = total_revenue - cogs_sold
    gross_margin_percentage = (gross_margin / total_revenue * 100) if total_revenue > 0 else 0
    
    return {
        "totalRevenue": total_revenue,
        "cogsSold": cogs_sold,
        "grossMargin": gross_margin,
        "grossMarginPercentage": round(gross_margin_percentage, 2),
        "outletName": outlet_name,
        "cogsPerPiece": cogs_per_piece
    }

@router.get("", response_model=List[SaleResponse])
async def get_sales(
    outlet_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Sale)
    
    if current_user.role == "admin_outlet" and current_user.assigned_outlet_id:
        query = query.where(Sale.outlet_id == current_user.assigned_outlet_id)
    elif outlet_id:
        query = query.where(Sale.outlet_id == outlet_id)
    
    if start_date:
        query = query.where(Sale.date >= start_date)
    if end_date:
        query = query.where(Sale.date <= end_date)
    
    query = query.order_by(Sale.date.desc())
    result = await db.execute(query)
    sales = result.scalars().all()
    
    results = []
    for sale in sales:
        outlet_result = await db.execute(select(Outlet).where(Outlet.id == sale.outlet_id))
        outlet = outlet_result.scalar_one_or_none()
        cogs = outlet.cogs_per_piece if outlet else 0
        outlet_name = outlet.name if outlet else None
        metrics = calculate_sale_metrics(sale, cogs, outlet_name)
        
        sale_dict = SaleResponse.model_validate(sale).model_dump()
        sale_dict.update(metrics)
        results.append(SaleResponse(**sale_dict))
    
    return results

@router.get("/{sale_id}", response_model=SaleResponse)
async def get_sale(
    sale_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Sale).where(Sale.id == sale_id))
    sale = result.scalar_one_or_none()
    
    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data penjualan tidak ditemukan"
        )
    
    if current_user.role == "admin_outlet" and current_user.assigned_outlet_id != sale.outlet_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki akses ke data ini"
        )
    
    outlet_result = await db.execute(select(Outlet).where(Outlet.id == sale.outlet_id))
    outlet = outlet_result.scalar_one_or_none()
    cogs = outlet.cogs_per_piece if outlet else 0
    outlet_name = outlet.name if outlet else None
    metrics = calculate_sale_metrics(sale, cogs, outlet_name)
    
    sale_dict = SaleResponse.model_validate(sale).model_dump()
    sale_dict.update(metrics)
    
    return SaleResponse(**sale_dict)

@router.post("", response_model=SaleResponse)
async def create_sale(
    request: SaleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin_outlet" and current_user.assigned_outlet_id != request.outlet_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki akses ke outlet ini"
        )
    
    existing_result = await db.execute(
        select(Sale).where(
            Sale.outlet_id == request.outlet_id,
            Sale.date == request.date
        )
    )
    existing = existing_result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data penjualan untuk tanggal ini sudah ada"
        )
    
    sale = Sale(**request.model_dump())
    
    db.add(sale)
    await db.commit()
    await db.refresh(sale)
    
    outlet_result = await db.execute(select(Outlet).where(Outlet.id == sale.outlet_id))
    outlet = outlet_result.scalar_one_or_none()
    cogs = outlet.cogs_per_piece if outlet else 0
    outlet_name = outlet.name if outlet else None
    metrics = calculate_sale_metrics(sale, cogs, outlet_name)
    
    sale_dict = SaleResponse.model_validate(sale).model_dump()
    sale_dict.update(metrics)
    
    return SaleResponse(**sale_dict)

@router.patch("/{sale_id}", response_model=SaleResponse)
async def update_sale(
    sale_id: str,
    request: SaleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Sale).where(Sale.id == sale_id))
    sale = result.scalar_one_or_none()
    
    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data penjualan tidak ditemukan"
        )
    
    if current_user.role == "admin_outlet" and current_user.assigned_outlet_id != sale.outlet_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki akses ke data ini"
        )
    
    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(sale, key, value)
    
    await db.commit()
    await db.refresh(sale)
    
    outlet_result = await db.execute(select(Outlet).where(Outlet.id == sale.outlet_id))
    outlet = outlet_result.scalar_one_or_none()
    cogs = outlet.cogs_per_piece if outlet else 0
    outlet_name = outlet.name if outlet else None
    metrics = calculate_sale_metrics(sale, cogs, outlet_name)
    
    sale_dict = SaleResponse.model_validate(sale).model_dump()
    sale_dict.update(metrics)
    
    return SaleResponse(**sale_dict)

@router.delete("/{sale_id}")
async def delete_sale(
    sale_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Sale).where(Sale.id == sale_id))
    sale = result.scalar_one_or_none()
    
    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data penjualan tidak ditemukan"
        )
    
    if current_user.role == "admin_outlet" and current_user.assigned_outlet_id != sale.outlet_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki akses ke data ini"
        )
    
    await db.delete(sale)
    await db.commit()
    
    return {"message": "Data penjualan berhasil dihapus"}
