# seed.py
# Minimal, idempotent seeding for demo users/offers/orders.
# Uses bcrypt_sha256 via auth.hash_password (no 72B limit).

from sqlmodel import Session, select
from database import engine, create_db_and_tables
from models import User, Offer, Order, UserRole
from auth import hash_password


def ensure_user(session: Session, email: str, password: str, role: UserRole) -> User:
    """Get existing user by email or create a new one."""
    user = session.exec(select(User).where(User.email == email)).first()
    if user:
        return user

    user = User(
        email=email,
        # NOTE: bcrypt_sha256 in auth removes the need to slice to 72 bytes
        password_hash=hash_password(password),
        role=role,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def ensure_offer(session: Session, **kwargs) -> Offer:
    """Create a fresh offer (caller ensures duplicates are not created)."""
    offer = Offer(**kwargs)
    session.add(offer)
    session.commit()
    session.refresh(offer)
    return offer


def run() -> None:
    create_db_and_tables()
    with Session(engine) as s:
        # Demo users
        producer = ensure_user(s, "producer@example.com", "Passw0rd!", UserRole.PRODUCER)
        buyer = ensure_user(s, "buyer@example.com", "Passw0rd!", UserRole.BUYER)

        # Seed offers only if there are none yet
        has_any_offer = s.exec(select(Offer)).first()
        if not has_any_offer:
            o1 = ensure_offer(
                s,
                producer_id=producer.id,
                product_name="Pellet sosnowy A1",
                product_category="Fuel",
                sku="PEL-A1-25KG",
                description="Pellet 6mm, worki 25kg",
                quantity=1000,
                unit_of_measure="kg",
                unit_price=1.20,
                currency="PLN",
                location="Kraków",
                active=True,
            )
            o2 = ensure_offer(
                s,
                producer_id=producer.id,
                product_name="Stal pręt 12mm",
                product_category="Steel",
                sku=None,
                description="Pręty zbrojeniowe",
                quantity=500,
                unit_of_measure="pcs",
                unit_price=9.99,
                currency="PLN",
                location="Katowice",
                active=True,
            )

            # One sample order
            ord1 = Order(
                buyer_id=buyer.id,
                offer_id=o1.id,
                quantity=50,
                unit_price_snapshot=o1.unit_price,
            )
            s.add(ord1)
            s.commit()

    print(
        "Seed done.\nLogins:\n"
        "  producer@example.com / Passw0rd!\n"
        "  buyer@example.com    / Passw0rd!"
    )


if __name__ == "__main__":
    run()
