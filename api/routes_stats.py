from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlmodel import Session, select

from database import get_session
from models import Offer, User, UserRole
from schemas import StatsOverview


router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/overview", response_model=StatsOverview)
def get_overview_stats(session: Session = Depends(get_session)):
    active_offers = session.exec(select(func.count(Offer.id)).where(Offer.active == True)).one()
    producers = session.exec(select(func.count(User.id)).where(User.role == UserRole.PRODUCER)).one()
    buyers = session.exec(select(func.count(User.id)).where(User.role == UserRole.BUYER)).one()

    return StatsOverview(active_offers=active_offers, producers=producers, buyers=buyers)
