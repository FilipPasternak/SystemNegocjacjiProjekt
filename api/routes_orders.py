from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from auth import require_role, get_current_user
from database import get_session
from models import Offer, Order, User, UserRole
from schemas import OrderCreate, OrderPublic

router = APIRouter(prefix="/api", tags=["orders"])

@router.post("/orders", response_model=OrderPublic)
def place_order(body: OrderCreate, user: User = Depends(require_role(UserRole.BUYER)), session: Session = Depends(get_session)):
    offer = session.get(Offer, body.offer_id)
    if not offer or not offer.active:
        raise HTTPException(status_code=404, detail="Not found")
    if body.quantity > offer.quantity:
        raise HTTPException(status_code=400, detail="Validation error: quantity exceeds available offer quantity")
    order = Order(
        buyer_id=user.id,
        offer_id=offer.id,
        quantity=body.quantity,
        unit_price_snapshot=offer.unit_price,
    )
    session.add(order)
    session.commit()
    session.refresh(order)
    return order

@router.get("/orders/mine", response_model=List[OrderPublic])
def my_orders(user: User = Depends(require_role(UserRole.BUYER)), session: Session = Depends(get_session)):
    return session.query(Order).where(Order.buyer_id == user.id).order_by(Order.created_at.desc()).all()
