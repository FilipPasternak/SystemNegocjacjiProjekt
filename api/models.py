from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import SQLModel, Field, Relationship

class UserRole(str, Enum):
    PRODUCER = "PRODUCER"
    BUYER = "BUYER"

class OrderStatus(str, Enum):
    PLACED = "PLACED"
    CONFIRMED = "CONFIRMED"  # not used in POC but defined

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    role: UserRole
    created_at: datetime = Field(default_factory=datetime.utcnow)

    offers: list["Offer"] = Relationship(back_populates="producer")
    orders: list["Order"] = Relationship(back_populates="buyer")

class Offer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    producer_id: int = Field(foreign_key="user.id", index=True)

    product_name: str
    product_category: str
    sku: Optional[str] = None
    description: Optional[str] = None

    quantity: int
    unit_of_measure: str  # "kg", "t", "pcs"
    unit_price: float
    currency: str  # "PLN", "EUR", "USD"

    location: str
    active: bool = True

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    producer: Optional[User] = Relationship(back_populates="offers")
    orders: list["Order"] = Relationship(back_populates="offer")

class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    buyer_id: int = Field(foreign_key="user.id", index=True)
    offer_id: int = Field(foreign_key="offer.id", index=True)

    quantity: int
    unit_price_snapshot: float
    status: OrderStatus = Field(default=OrderStatus.PLACED)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    buyer: Optional[User] = Relationship(back_populates="orders")
    offer: Optional[Offer] = Relationship(back_populates="orders")
