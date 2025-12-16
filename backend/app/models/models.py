from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from ..database import Base

class UserRole(str, enum.Enum):
    super_admin = "super_admin"
    owner = "owner"
    admin_outlet = "admin_outlet"
    finance = "finance"

class ExpenseType(str, enum.Enum):
    harian = "harian"
    bulanan = "bulanan"
    gaji = "gaji"

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    profile_image_url = Column(String, nullable=True)
    role = Column(String, default="owner")
    password = Column(String, nullable=True)
    assigned_outlet_id = Column(String, ForeignKey("outlets.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    assigned_outlet = relationship("Outlet", back_populates="assigned_users")

class Outlet(Base):
    __tablename__ = "outlets"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    cogs_per_piece = Column(Float, default=0)
    created_at = Column(DateTime, server_default=func.now())
    
    sales = relationship("Sale", back_populates="outlet", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="outlet", cascade="all, delete-orphan")
    assigned_users = relationship("User", back_populates="assigned_outlet")

class Sale(Base):
    __tablename__ = "sales"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    outlet_id = Column(String, ForeignKey("outlets.id"), nullable=False)
    date = Column(String, nullable=False)
    
    cash = Column(Integer, default=0)
    qris = Column(Integer, default=0)
    grab = Column(Integer, default=0)
    gofood = Column(Integer, default=0)
    shopee = Column(Integer, default=0)
    tiktok = Column(Integer, default=0)
    
    total_sold = Column(Integer, default=0)
    remaining = Column(Integer, default=0)
    returned = Column(Integer, default=0)
    total_production = Column(Integer, default=0)
    sold_out_time = Column(String, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    
    outlet = relationship("Outlet", back_populates="sales")

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    outlet_id = Column(String, ForeignKey("outlets.id"), nullable=False)
    date = Column(String, nullable=False)
    type = Column(String, default="harian")
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    proof_url = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    outlet = relationship("Outlet", back_populates="expenses")
