from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
import aiofiles

from ..database import get_db
from ..models.models import Expense, User
from ..schemas.schemas import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from ..services.auth import get_current_user, require_roles

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

UPLOAD_DIR = "uploads/proofs"

@router.get("", response_model=List[ExpenseResponse])
async def get_expenses(
    outlet_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Expense)
    
    if current_user.role == "admin_outlet" and current_user.assigned_outlet_id:
        query = query.filter(Expense.outlet_id == current_user.assigned_outlet_id)
        query = query.filter(Expense.type != "gaji")
    elif outlet_id:
        query = query.filter(Expense.outlet_id == outlet_id)
    
    if current_user.role not in ["super_admin", "owner"]:
        query = query.filter(Expense.type != "gaji")
    
    if start_date:
        query = query.filter(Expense.date >= start_date)
    if end_date:
        query = query.filter(Expense.date <= end_date)
    if type:
        query = query.filter(Expense.type == type)
    
    expenses = query.order_by(Expense.date.desc()).all()
    
    return [ExpenseResponse.model_validate(e) for e in expenses]

@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    expense_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data pengeluaran tidak ditemukan"
        )
    
    if current_user.role == "admin_outlet" and current_user.assigned_outlet_id != expense.outlet_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki akses ke data ini"
        )
    
    if expense.type == "gaji" and current_user.role not in ["super_admin", "owner"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki akses ke data gaji"
        )
    
    return ExpenseResponse.model_validate(expense)

@router.post("", response_model=ExpenseResponse)
async def create_expense(
    request: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin_outlet" and current_user.assigned_outlet_id != request.outlet_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki akses ke outlet ini"
        )
    
    if request.type == "gaji" and current_user.role not in ["super_admin", "owner"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya owner yang dapat menambahkan pengeluaran gaji"
        )
    
    expense = Expense(**request.model_dump())
    
    db.add(expense)
    db.commit()
    db.refresh(expense)
    
    return ExpenseResponse.model_validate(expense)

@router.patch("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: str,
    request: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data pengeluaran tidak ditemukan"
        )
    
    if current_user.role == "admin_outlet" and current_user.assigned_outlet_id != expense.outlet_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki akses ke data ini"
        )
    
    if expense.type == "gaji" and current_user.role not in ["super_admin", "owner"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki akses ke data gaji"
        )
    
    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(expense, key, value)
    
    db.commit()
    db.refresh(expense)
    
    return ExpenseResponse.model_validate(expense)

@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data pengeluaran tidak ditemukan"
        )
    
    if current_user.role == "admin_outlet" and current_user.assigned_outlet_id != expense.outlet_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki akses ke data ini"
        )
    
    if expense.type == "gaji" and current_user.role not in ["super_admin", "owner"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki akses ke data gaji"
        )
    
    db.delete(expense)
    db.commit()
    
    return {"message": "Data pengeluaran berhasil dihapus"}

@router.post("/upload")
async def upload_proof(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    return {
        "url": f"/uploads/proofs/{unique_filename}",
        "filename": unique_filename
    }
