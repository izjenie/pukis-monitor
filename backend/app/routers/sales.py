from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ..database import get_db
from ..models.models import Sale, Outlet, User
from ..schemas.schemas import SaleCreate, SaleUpdate, SaleResponse
from ..services.auth import get_current_user

router = APIRouter(prefix="/api/sales", tags=["Sales"])

def calculate_sale_metrics(sale: Sale, cogs_per_piece: float) -> dict:
    total_revenue = sale.cash + sale.qris + sale.grab + sale.gofood + sale.shopee + sale.tiktok
    total_cogs = sale.total_sold * cogs_per_piece
    gross_margin = total_revenue - total_cogs
    margin_percentage = (gross_margin / total_revenue * 100) if total_revenue > 0 else 0
    
    return {
        "total_revenue": total_revenue,
        "gross_margin": gross_margin,
        "margin_percentage": round(margin_percentage, 2)
    }

@router.get("", response_model=List[SaleResponse])
async def get_sales(
    outlet_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Sale)
    
    if current_user.role == "admin_outlet" and current_user.assigned_outlet_id:
        query = query.filter(Sale.outlet_id == current_user.assigned_outlet_id)
    elif outlet_id:
        query = query.filter(Sale.outlet_id == outlet_id)
    
    if start_date:
        query = query.filter(Sale.date >= start_date)
    if end_date:
        query = query.filter(Sale.date <= end_date)
    
    sales = query.order_by(Sale.date.desc()).all()
    
    results = []
    for sale in sales:
        outlet = db.query(Outlet).filter(Outlet.id == sale.outlet_id).first()
        cogs = outlet.cogs_per_piece if outlet else 0
        metrics = calculate_sale_metrics(sale, cogs)
        
        sale_dict = SaleResponse.model_validate(sale).model_dump()
        sale_dict.update(metrics)
        results.append(SaleResponse(**sale_dict))
    
    return results

@router.get("/{sale_id}", response_model=SaleResponse)
async def get_sale(
    sale_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    
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
    
    outlet = db.query(Outlet).filter(Outlet.id == sale.outlet_id).first()
    cogs = outlet.cogs_per_piece if outlet else 0
    metrics = calculate_sale_metrics(sale, cogs)
    
    sale_dict = SaleResponse.model_validate(sale).model_dump()
    sale_dict.update(metrics)
    
    return SaleResponse(**sale_dict)

@router.post("", response_model=SaleResponse)
async def create_sale(
    request: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin_outlet" and current_user.assigned_outlet_id != request.outlet_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki akses ke outlet ini"
        )
    
    existing = db.query(Sale).filter(
        Sale.outlet_id == request.outlet_id,
        Sale.date == request.date
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data penjualan untuk tanggal ini sudah ada"
        )
    
    sale = Sale(**request.model_dump())
    
    db.add(sale)
    db.commit()
    db.refresh(sale)
    
    outlet = db.query(Outlet).filter(Outlet.id == sale.outlet_id).first()
    cogs = outlet.cogs_per_piece if outlet else 0
    metrics = calculate_sale_metrics(sale, cogs)
    
    sale_dict = SaleResponse.model_validate(sale).model_dump()
    sale_dict.update(metrics)
    
    return SaleResponse(**sale_dict)

@router.patch("/{sale_id}", response_model=SaleResponse)
async def update_sale(
    sale_id: str,
    request: SaleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    
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
    
    db.commit()
    db.refresh(sale)
    
    outlet = db.query(Outlet).filter(Outlet.id == sale.outlet_id).first()
    cogs = outlet.cogs_per_piece if outlet else 0
    metrics = calculate_sale_metrics(sale, cogs)
    
    sale_dict = SaleResponse.model_validate(sale).model_dump()
    sale_dict.update(metrics)
    
    return SaleResponse(**sale_dict)

@router.delete("/{sale_id}")
async def delete_sale(
    sale_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    
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
    
    db.delete(sale)
    db.commit()
    
    return {"message": "Data penjualan berhasil dihapus"}
