"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function MyOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  useEffect(() => {
    apiFetch("/api/producer/my-offers").then(setOffers).catch(() => setOffers([]));
  }, []);

  async function toggle(offer: any) {
    const res = await apiFetch(`/api/offers/${offer.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: !offer.active }),
    });
    setOffers((prev) => prev.map((o) => (o.id === res.id ? res : o)));
  }

  return (
    <section>
      <div className="container grid">
        <div className="badge">Oferty producenta</div>
        <div className="grid" style={{ gap: 16 }}>
          {offers.map((o) => (
            <div key={o.id} className="card" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div className="stack">
                <div className="product-card__title">{o.product_name}</div>
                <div className="muted text-sm">Aktywna: {String(o.active)} • Ilość: {o.quantity}</div>
                <div className="product-card__price">
                  {o.unit_price} {o.currency}
                </div>
              </div>
              <button onClick={() => toggle(o)} className="btn btn--ghost" style={{ alignSelf: "center" }}>
                Przełącz
              </button>
            </div>
          ))}
          {!offers.length && <div className="muted">Nie opublikowałeś jeszcze żadnych ofert.</div>}
        </div>
      </div>
    </section>
  );
}
