from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, col

from auth import require_role, require_offer_owner, get_current_user
from database import get_session
from models import Offer, UserRole, User
from schemas import OfferCreate, OfferPublic, OfferUpdate

router = APIRouter(prefix="/api", tags=["offers"])

@router.post("/offers", response_model=OfferPublic)
def create_offer(body: OfferCreate, session: Session = Depends(get_session), user: User = Depends(require_role(UserRole.PRODUCER))):
    # Minimal required fields are enforced by schema
    offer = Offer(
        producer_id=user.id,
        **body.model_dump(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(offer)
    session.commit()
    session.refresh(offer)
    return offer

@router.get("/offers", response_model=List[OfferPublic])
def list_offers(
    q: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    location: Optional[str] = None,
    active: Optional[bool] = True,
    session: Session = Depends(get_session),
):
    stmt = select(Offer)
    if active is not None:
        stmt = stmt.where(Offer.active == active)
    if q:
        like = f"%{q}%"
        stmt = stmt.where((Offer.product_name.ilike(like)) | (Offer.description.ilike(like)))
    if category:
        stmt = stmt.where(Offer.product_category == category)
    if min_price is not None:
        stmt = stmt.where(col(Offer.unit_price) >= min_price)
    if max_price is not None:
        stmt = stmt.where(col(Offer.unit_price) <= max_price)
    if location:
        stmt = stmt.where(Offer.location == location)
    return session.exec(stmt.order_by(Offer.created_at.desc())).all()

@router.get("/offers/{offer_id}", response_model=OfferPublic)
def get_offer(offer_id: int, session: Session = Depends(get_session)):
    offer = session.get(Offer, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Not found")
    return offer

@router.patch("/offers/{offer_id}", response_model=OfferPublic)
def update_offer(offer_id: int, body: OfferUpdate, session: Session = Depends(get_session), _user=Depends(require_offer_owner)):
    offer = session.get(Offer, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Not found")
    update_data = body.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(offer, k, v)
    offer.updated_at = datetime.utcnow()
    session.add(offer)
    session.commit()
    session.refresh(offer)
    return offer

@router.get("/producer/my-offers", response_model=List[OfferPublic])
def my_offers(user: User = Depends(require_role(UserRole.PRODUCER)), session: Session = Depends(get_session)):
    return session.exec(select(Offer).where(Offer.producer_id == user.id).order_by(Offer.created_at.desc())).all()
