from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.models import User
from ..schemas.schemas import UserCreate, UserResponse
from ..services.auth import get_password_hash, require_roles

router = APIRouter(prefix="/api/super-admin", tags=["Super Admin"])

@router.get("/admins", response_model=List[UserResponse])
async def get_admins(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["super_admin"]))
):
    admins = db.query(User).filter(User.role != "super_admin").order_by(User.created_at.desc()).all()
    return [UserResponse.model_validate(a) for a in admins]

@router.post("/admins", response_model=UserResponse)
async def create_admin(
    request: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["super_admin"]))
):
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar"
        )
    
    hashed_password = get_password_hash(request.password) if request.password else None
    
    new_user = User(
        email=request.email,
        first_name=request.first_name,
        last_name=request.last_name,
        role=request.role,
        password=hashed_password,
        assigned_outlet_id=request.assigned_outlet_id
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return UserResponse.model_validate(new_user)

@router.delete("/admins/{user_id}")
async def delete_admin(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["super_admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User tidak ditemukan"
        )
    
    if user.role == "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tidak dapat menghapus super admin"
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": "Admin berhasil dihapus"}
