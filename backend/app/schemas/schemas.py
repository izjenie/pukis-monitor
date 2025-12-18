from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    super_admin = "super_admin"
    owner = "owner"
    admin_outlet = "admin_outlet"
    finance = "finance"

class ExpenseType(str, Enum):
    harian = "harian"
    bulanan = "bulanan"
    gaji = "gaji"

class UserBase(BaseModel):
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str = "owner"
    assigned_outlet_id: Optional[str] = None

class UserCreate(UserBase):
    password: Optional[str] = None

class UserResponse(UserBase):
    id: str
    profile_image_url: Optional[str] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class OutletBase(BaseModel):
    name: str
    cogs_per_piece: float = 0

class OutletCreate(OutletBase):
    pass

class OutletUpdate(BaseModel):
    name: Optional[str] = None
    cogs_per_piece: Optional[float] = None

class OutletResponse(OutletBase):
    id: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SaleBase(BaseModel):
    outletId: str = Field(alias="outlet_id")
    date: str
    cash: int = 0
    qris: int = 0
    grab: int = 0
    gofood: int = 0
    shopee: int = 0
    tiktok: int = 0
    totalSold: int = Field(default=0, alias="total_sold")
    remaining: int = 0
    returned: int = 0
    totalProduction: int = Field(default=0, alias="total_production")
    soldOutTime: Optional[str] = Field(default=None, alias="sold_out_time")
    
    class Config:
        populate_by_name = True

class SaleCreate(BaseModel):
    outlet_id: str
    date: str
    cash: int = 0
    qris: int = 0
    grab: int = 0
    gofood: int = 0
    shopee: int = 0
    tiktok: int = 0
    total_sold: int = 0
    remaining: int = 0
    returned: int = 0
    total_production: int = 0
    sold_out_time: Optional[str] = None

class SaleUpdate(BaseModel):
    cash: Optional[int] = None
    qris: Optional[int] = None
    grab: Optional[int] = None
    gofood: Optional[int] = None
    shopee: Optional[int] = None
    tiktok: Optional[int] = None
    total_sold: Optional[int] = None
    remaining: Optional[int] = None
    returned: Optional[int] = None
    total_production: Optional[int] = None
    sold_out_time: Optional[str] = None

class SaleResponse(BaseModel):
    id: str
    outletId: str = Field(alias="outlet_id")
    date: str
    cash: int = 0
    qris: int = 0
    grab: int = 0
    gofood: int = 0
    shopee: int = 0
    tiktok: int = 0
    totalSold: int = Field(default=0, alias="total_sold")
    remaining: int = 0
    returned: int = 0
    totalProduction: int = Field(default=0, alias="total_production")
    soldOutTime: Optional[str] = Field(default=None, alias="sold_out_time")
    createdAt: Optional[datetime] = Field(default=None, alias="created_at")
    totalRevenue: Optional[float] = None
    cogsSold: Optional[float] = None
    grossMargin: Optional[float] = None
    grossMarginPercentage: Optional[float] = None
    outletName: Optional[str] = None
    cogsPerPiece: Optional[float] = None
    
    class Config:
        from_attributes = True
        populate_by_name = True

class ExpenseBase(BaseModel):
    outlet_id: str
    date: str
    type: str = "harian"
    description: str
    amount: float = Field(ge=0)
    proof_url: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = Field(default=None, ge=0)
    type: Optional[str] = None
    proof_url: Optional[str] = None

class ExpenseResponse(ExpenseBase):
    id: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class MTDSummary(BaseModel):
    outlet_id: str
    outlet_name: str
    period_start: str
    period_end: str
    total_revenue: float
    total_expenses: float
    total_cogs: float
    gross_profit: float
    net_profit: float
    total_sold: int
    days_count: int
