from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel
from models import UserRole, OrderStatus, NegotiationStatus

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


class StatsOverview(SQLModel):
    active_offers: int
    producers: int
    buyers: int

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


# Negotiations
class NegotiationMessagePublic(SQLModel):
    id: int
    sender_id: int
    proposed_price: Optional[float] = None
    message: Optional[str] = None
    created_at: datetime


class NegotiationPublic(SQLModel):
    id: int
    offer_id: int
    buyer_id: int
    producer_id: int
    status: NegotiationStatus
    agreed_price: Optional[float] = None
    created_at: datetime
    messages: List[NegotiationMessagePublic]


class NegotiationCreate(SQLModel):
    offer_id: int
    proposed_price: float
    message: Optional[str] = None


class NegotiationMessageCreate(SQLModel):
    proposed_price: Optional[float] = None
    message: Optional[str] = None
    status_update: Optional[NegotiationStatus] = None
