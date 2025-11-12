from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel
from models import UserRole, OrderStatus

# Auth
class RegisterRequest(SQLModel):
    email: str
    password: str
    role: UserRole

class LoginRequest(SQLModel):
    email: str
    password: str

class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserPublic"

class UserPublic(SQLModel):
    id: int
    email: str
    role: UserRole
    created_at: datetime

# Offer
class OfferBase(SQLModel):
    product_name: str
    product_category: str
    sku: Optional[str] = None
    description: Optional[str] = None
    quantity: int
    unit_of_measure: str
    unit_price: float
    currency: str
    location: str
    active: bool = True

class OfferCreate(OfferBase):
    pass

class OfferUpdate(SQLModel):
    product_name: Optional[str] = None
    product_category: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = None
    unit_of_measure: Optional[str] = None
    unit_price: Optional[float] = None
    currency: Optional[str] = None
    location: Optional[str] = None
    active: Optional[bool] = None

class OfferPublic(OfferBase):
    id: int
    producer_id: int
    created_at: datetime
    updated_at: datetime

# Order
class OrderCreate(SQLModel):
    offer_id: int
    quantity: int

class OrderPublic(SQLModel):
    id: int
    buyer_id: int
    offer_id: int
    quantity: int
    unit_price_snapshot: float
    status: OrderStatus
    created_at: datetime
