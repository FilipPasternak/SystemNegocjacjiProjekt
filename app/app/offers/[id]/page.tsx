"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useParams } from "next/navigation";

export default function OfferDetails() {
  const params = useParams<{ id: string }>();
  const [offer, setOffer] = useState<any>(null);
  const [qty, setQty] = useState("1");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch(`/api/offers/${params.id}`).then(setOffer);
  }, [params.id]);

  if (!offer) return <div className="muted">Ładowanie...</div>;

  return (
    <section>
      <div className="container grid">
        <div className="badge">Szczegóły oferty #{offer.id}</div>
        <div className="device">
          <div className="device__glow" />
          <div className="device__grid" />
          <div className="device__card">
            <div className="pill">{offer.product_category}</div>
            <h4>{offer.product_name}</h4>
            <p className="muted">
              {offer.unit_price} {offer.currency} / {offer.unit_of_measure} • {offer.location}
            </p>
          </div>
        </div>

        <div className="contact__card stack">
          <div className="grid" style={{ gap: 6 }}>
            <div className="muted text-sm">Identyfikator SKU</div>
            <div className="product-card__title">{offer.sku || "Brak"}</div>
          </div>
          <div className="muted">{offer.description || "Brak opisu"}</div>
          <div className="product-card__meta">
            <span>Dostępna ilość: {offer.quantity}</span>
            <span className="product-card__price">
              {offer.unit_price} {offer.currency}
            </span>
          </div>

          <div className="divider" />

          <label className="stack">
            <span className="muted text-sm">Zamawiana ilość</span>
            <input
              type="number"
              min={1}
              className="input"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </label>
          <div className="hero__cta">
            <button
              onClick={async () => {
                try {
                  setSubmitting(true);
                  await apiFetch("/api/orders", {
                    method: "POST",
                    body: JSON.stringify({ offer_id: Number(offer.id), quantity: Number(qty) }),
                  });
                  alert("Order placed");
                  window.location.href = "/orders";
                } catch (e: any) {
                  alert(e.message);
                } finally {
                  setSubmitting(false);
                }
              }}
              className="btn"
              disabled={submitting}
            >
              {submitting ? "Przetwarzam..." : "Zamów"}
            </button>
            <Link href={`/offers/${offer.id}/negotiate`} className="btn btn--ghost">
              Negocjuj
            </Link>
            <Link href="/offers" className="btn btn--ghost">
              Wróć do listy
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
