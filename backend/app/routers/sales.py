from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy import func

from ..database import get_db
from ..models.models import Sale, Outlet, User, Expense
from ..schemas.schemas import SaleCreate, SaleUpdate, SaleResponse, MTDSummary
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

def get_mtd_period(date: datetime = None):
    if date is None:
        date = datetime.now()
    
    if date.day <= 10:
        if date.month == 1:
            start = datetime(date.year - 1, 12, 11)
        else:
            start = datetime(date.year, date.month - 1, 11)
        end = datetime(date.year, date.month, 10)
    else:
        start = datetime(date.year, date.month, 11)
        if date.month == 12:
            end = datetime(date.year + 1, 1, 10)
        else:
            end = datetime(date.year, date.month + 1, 10)
    
    return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")

@router.get("/mtd", response_model=List[MTDSummary])
async def get_mtd_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    period_start, period_end = get_mtd_period()
    
    if current_user.role == "admin_outlet" and current_user.assigned_outlet_id:
        outlets = db.query(Outlet).filter(Outlet.id == current_user.assigned_outlet_id).all()
    else:
        outlets = db.query(Outlet).all()
    
    results = []
    
    for outlet in outlets:
        sales = db.query(Sale).filter(
            Sale.outlet_id == outlet.id,
            Sale.date >= period_start,
            Sale.date <= period_end
        ).all()
        
        total_revenue = 0
        total_sold = 0
        
        for sale in sales:
            total_revenue += sale.cash + sale.qris + sale.grab + sale.gofood + sale.shopee + sale.tiktok
            total_sold += sale.total_sold
        
        total_cogs = total_sold * outlet.cogs_per_piece
        
        expenses = db.query(Expense).filter(
            Expense.outlet_id == outlet.id,
            Expense.date >= period_start,
            Expense.date <= period_end
        ).all()
        
        total_expenses = sum(e.amount for e in expenses)
        gross_profit = total_revenue - total_cogs
        net_profit = gross_profit - total_expenses
        
        results.append(MTDSummary(
            outlet_id=outlet.id,
            outlet_name=outlet.name,
            period_start=period_start,
            period_end=period_end,
            total_revenue=total_revenue,
            total_expenses=total_expenses,
            total_cogs=total_cogs,
            gross_profit=gross_profit,
            net_profit=net_profit,
            total_sold=total_sold,
            days_count=len(sales)
        ))
    
    return results
