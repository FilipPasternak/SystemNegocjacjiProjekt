from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from auth import get_current_user, require_role
from database import get_session
from models import (
    Negotiation,
    NegotiationMessage,
    NegotiationStatus,
    Offer,
    User,
    UserRole,
)
from schemas import NegotiationCreate, NegotiationMessageCreate, NegotiationPublic

router = APIRouter(prefix="/api", tags=["negotiations"])


def _assert_participant(negotiation: Negotiation, user: User):
    if user.id not in [negotiation.buyer_id, negotiation.producer_id]:
        raise HTTPException(status_code=403, detail="Forbidden")


def _load_with_messages(session: Session, negotiation_id: int) -> Negotiation:
    negotiation = session.get(Negotiation, negotiation_id)
    if not negotiation:
        raise HTTPException(status_code=404, detail="Not found")
    negotiation.messages = (
        session.exec(
            select(NegotiationMessage)
            .where(NegotiationMessage.negotiation_id == negotiation.id)
            .order_by(NegotiationMessage.created_at)
        ).all()
    )
    return negotiation


@router.post("/negotiations", response_model=NegotiationPublic)
def start_negotiation(
    body: NegotiationCreate,
    user: User = Depends(require_role(UserRole.BUYER)),
    session: Session = Depends(get_session),
):
    offer = session.get(Offer, body.offer_id)
    if not offer or not offer.active:
        raise HTTPException(status_code=404, detail="Offer not found")

    negotiation = Negotiation(
        offer_id=offer.id,
        buyer_id=user.id,
        producer_id=offer.producer_id,
        status=NegotiationStatus.OPEN,
        created_at=datetime.utcnow(),
    )
    session.add(negotiation)
    session.commit()
    session.refresh(negotiation)

    message = NegotiationMessage(
        negotiation_id=negotiation.id,
        sender_id=user.id,
        proposed_price=body.proposed_price,
        message=body.message,
        created_at=datetime.utcnow(),
    )
    session.add(message)
    session.commit()

    return _load_with_messages(session, negotiation.id)


@router.get("/negotiations/{negotiation_id}", response_model=NegotiationPublic)
def get_negotiation(
    negotiation_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    negotiation = _load_with_messages(session, negotiation_id)
    _assert_participant(negotiation, user)
    return negotiation


@router.get("/negotiations/for-offer/{offer_id}", response_model=NegotiationPublic)
def get_negotiation_for_offer(
    offer_id: int,
    user: User = Depends(require_role(UserRole.BUYER)),
    session: Session = Depends(get_session),
):
    negotiation = session.exec(
        select(Negotiation).where(
            Negotiation.offer_id == offer_id,
            Negotiation.buyer_id == user.id,
        )
    ).first()
    if not negotiation:
        raise HTTPException(status_code=404, detail="Not found")
    return _load_with_messages(session, negotiation.id)


@router.post("/negotiations/{negotiation_id}/messages", response_model=NegotiationPublic)
def post_message(
    negotiation_id: int,
    body: NegotiationMessageCreate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    negotiation = _load_with_messages(session, negotiation_id)
    _assert_participant(negotiation, user)

    if negotiation.status != NegotiationStatus.OPEN and body.status_update is None:
        raise HTTPException(status_code=400, detail="Negotiation is closed")

    if body.status_update is not None:
        if user.id != negotiation.producer_id:
            raise HTTPException(status_code=403, detail="Only producer can change status")
        if negotiation.status != NegotiationStatus.OPEN:
            raise HTTPException(status_code=400, detail="Negotiation already closed")
        if body.status_update == NegotiationStatus.ACCEPTED:
            negotiation.status = NegotiationStatus.ACCEPTED
            negotiation.agreed_price = body.proposed_price or negotiation.agreed_price
        elif body.status_update == NegotiationStatus.REJECTED:
            negotiation.status = NegotiationStatus.REJECTED
        else:
            raise HTTPException(status_code=400, detail="Invalid status update")
    else:
        if body.proposed_price is None:
            raise HTTPException(status_code=400, detail="proposed_price is required for a new offer")

    message = NegotiationMessage(
        negotiation_id=negotiation.id,
        sender_id=user.id,
        proposed_price=body.proposed_price,
        message=body.message,
        created_at=datetime.utcnow(),
    )
    session.add(message)
    session.add(negotiation)
    session.commit()

    return _load_with_messages(session, negotiation.id)
