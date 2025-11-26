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

            # Additional catalog so listings look realistic during demos
            base_products = [
                {
                    "name": "Brykiet dębowy premium",
                    "category": "Fuel",
                    "unit": "kg",
                    "price": 1.45,
                    "description": "Brykiet 8cm, worki 10kg",
                    "sku_prefix": "BRY-OAK",
                },
                {
                    "name": "Deska tarasowa modrzew",
                    "category": "Timber",
                    "unit": "m2",
                    "price": 74.50,
                    "description": "Ryflowana, klasa A",
                    "sku_prefix": "WOOD-TAR",
                },
                {
                    "name": "Blacha trapezowa T18",
                    "category": "Steel",
                    "unit": "m2",
                    "price": 32.00,
                    "description": "Ocynkowana, grubość 0.5mm",
                    "sku_prefix": "STEEL-T18",
                },
                {
                    "name": "Rura stalowa 80mm",
                    "category": "Steel",
                    "unit": "m",
                    "price": 18.40,
                    "description": "S235, szew zgrzewany",
                    "sku_prefix": "PIPE-080",
                },
                {
                    "name": "Kruszywo granitowe 8-16",
                    "category": "Construction",
                    "unit": "ton",
                    "price": 115.00,
                    "description": "Frakcja 8-16mm",
                    "sku_prefix": "AGG-GRA",
                },
                {
                    "name": "Cement portlandzki CEM I 42,5R",
                    "category": "Construction",
                    "unit": "kg",
                    "price": 0.68,
                    "description": "Worki 25kg",
                    "sku_prefix": "CEM-425",
                },
                {
                    "name": "Siatka zbrojeniowa 150x150x6",
                    "category": "Steel",
                    "unit": "m2",
                    "price": 14.80,
                    "description": "Ocynk, arkusz 2x3m",
                    "sku_prefix": "REBAR-MESH",
                },
                {
                    "name": "Pellet słonecznikowy",
                    "category": "Fuel",
                    "unit": "kg",
                    "price": 1.05,
                    "description": "Średnica 8mm",
                    "sku_prefix": "PEL-SUN",
                },
                {
                    "name": "Rzepak wysokoolejowy",
                    "category": "Agricultural",
                    "unit": "ton",
                    "price": 2200.00,
                    "description": "Wilgotność <8%",
                    "sku_prefix": "CROP-RZE",
                },
                {
                    "name": "Pszenica konsumpcyjna",
                    "category": "Agricultural",
                    "unit": "ton",
                    "price": 980.00,
                    "description": "Białko min. 12%",
                    "sku_prefix": "CROP-PSZ",
                },
                {
                    "name": "Olej rzepakowy techniczny",
                    "category": "Chemical",
                    "unit": "l",
                    "price": 5.40,
                    "description": "IBC 1000l",
                    "sku_prefix": "OIL-RAP",
                },
                {
                    "name": "Granulat PP homo",
                    "category": "Plastics",
                    "unit": "kg",
                    "price": 4.90,
                    "description": "MFR 12",
                    "sku_prefix": "PP-HOMO",
                },
                {
                    "name": "Granulat PE-LD natural",
                    "category": "Plastics",
                    "unit": "kg",
                    "price": 4.20,
                    "description": "Do folii",
                    "sku_prefix": "PE-LD-NAT",
                },
                {
                    "name": "Palety drewniane EUR",
                    "category": "Logistics",
                    "unit": "pcs",
                    "price": 32.00,
                    "description": "Certyfikat EPAL",
                    "sku_prefix": "PAL-EUR",
                },
                {
                    "name": "Tkanina bawełniana 160g",
                    "category": "Textile",
                    "unit": "m",
                    "price": 12.50,
                    "description": "Surowa bielona",
                    "sku_prefix": "FAB-BAW",
                },
                {
                    "name": "Przędza poliestrowa 300D",
                    "category": "Textile",
                    "unit": "kg",
                    "price": 7.10,
                    "description": "Do produkcji lin",
                    "sku_prefix": "YARN-PES",
                },
                {
                    "name": "Śruby ocynk M12x60",
                    "category": "Hardware",
                    "unit": "pcs",
                    "price": 0.45,
                    "description": "Klasa 8.8",
                    "sku_prefix": "BOLT-M12",
                },
                {
                    "name": "Łożyska kulkowe 6204",
                    "category": "Hardware",
                    "unit": "pcs",
                    "price": 6.30,
                    "description": "Z uszczelnieniem 2RS",
                    "sku_prefix": "BRG-6204",
                },
                {
                    "name": "Kabel YDYp 3x2,5",
                    "category": "Electrical",
                    "unit": "m",
                    "price": 3.20,
                    "description": "Do instalacji wewnętrznych",
                    "sku_prefix": "CABLE-325",
                },
                {
                    "name": "Panel fotowoltaiczny 450W",
                    "category": "Electrical",
                    "unit": "pcs",
                    "price": 710.00,
                    "description": "Mono perc",
                    "sku_prefix": "PV-450",
                },
                {
                    "name": "Akumulator trakcyjny 200Ah",
                    "category": "Electrical",
                    "unit": "pcs",
                    "price": 1290.00,
                    "description": "AGM, 12V",
                    "sku_prefix": "BAT-200",
                },
                {
                    "name": "Silnik elektryczny 5.5kW",
                    "category": "Electrical",
                    "unit": "pcs",
                    "price": 980.00,
                    "description": "IE3, 1450 obr./min",
                    "sku_prefix": "MOTOR-55",
                },
                {
                    "name": "Farba epoksydowa przemysłowa",
                    "category": "Chemical",
                    "unit": "kg",
                    "price": 23.00,
                    "description": "Dwuskładnikowa, RAL 7016",
                    "sku_prefix": "PAINT-EPO",
                },
                {
                    "name": "Płyta OSB3 18mm",
                    "category": "Construction",
                    "unit": "m2",
                    "price": 41.00,
                    "description": "Krawędź prosta",
                    "sku_prefix": "OSB-18",
                },
                {
                    "name": "Kartony klapowe 600x400x400",
                    "category": "Packaging",
                    "unit": "pcs",
                    "price": 2.10,
                    "description": "Tektura 5-warstwowa",
                    "sku_prefix": "BOX-640",
                },
            ]

            locations = [
                "Warszawa",
                "Kraków",
                "Gdańsk",
                "Wrocław",
                "Poznań",
                "Łódź",
                "Katowice",
                "Rzeszów",
                "Białystok",
                "Lublin",
            ]

            offers_seed_data = []
            for idx in range(100):
                base = base_products[idx % len(base_products)]
                location = locations[idx % len(locations)]
                quantity = 200 + 25 * (idx % 20)
                unit_price = round(base["price"] * (1 + (idx % 5) * 0.05), 2)
                offers_seed_data.append(
                    {
                        "producer_id": producer.id,
                        "product_name": f"{base['name']} #{idx + 1}",
                        "product_category": base["category"],
                        "sku": f"{base['sku_prefix']}-{idx + 1:03d}",
                        "description": f"{base['description']} Dostawa: {location}.",
                        "quantity": quantity,
                        "unit_of_measure": base["unit"],
                        "unit_price": unit_price,
                        "currency": "PLN",
                        "location": location,
                        "active": True,
                    }
                )

            for offer_data in offers_seed_data:
                ensure_offer(s, **offer_data)

    print(
        "Seed done.\nLogins:\n"
        "  producer@example.com / Passw0rd!\n"
        "  buyer@example.com    / Passw0rd!"
    )


if __name__ == "__main__":
    run()
