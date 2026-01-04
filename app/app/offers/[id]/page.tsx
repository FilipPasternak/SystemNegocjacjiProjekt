"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AUTH_CHANGE_EVENT, apiFetch, getUser } from "@/lib/api";
import { useParams } from "next/navigation";

export default function OfferDetails() {
  const params = useParams<{ id: string }>();
  const [offer, setOffer] = useState<any>(null);
  const [qty, setQty] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<ReturnType<typeof getUser> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    apiFetch(`/api/offers/${params.id}`).then(setOffer);
  }, [params.id]);

  useEffect(() => {
    const syncUser = () => {
      setUser(getUser());
      setAuthReady(true);
    };
    syncUser();
    window.addEventListener(AUTH_CHANGE_EVENT, syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  if (!offer) return <div className="muted">Ładowanie...</div>;

  const canOrder = !!user && user.role === "BUYER" && offer.quantity > 0;
  const orderCtaLabel = !authReady
    ? "Ładowanie..."
    : !user
      ? "Zaloguj się, aby zamówić"
      : user.role !== "BUYER"
        ? "Dostępne tylko dla kupujących"
        : offer.quantity === 0
          ? "Brak dostępnej ilości"
          : "Zamów";

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
              max={offer.quantity}
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
                  setError(null);
                  const parsedQty = Number(qty);
                  if (!Number.isFinite(parsedQty) || parsedQty <= 0) {
                    setError("Ilość musi być większa od zera.");
                    return;
                  }
                  if (!user) {
                    setError("Zaloguj się, aby złożyć zamówienie.");
                    return;
                  }
                  if (user.role !== "BUYER") {
                    setError("Tylko kupujący mogą składać zamówienia.");
                    return;
                  }
                  if (parsedQty > offer.quantity) {
                    setError("Nie możesz zamówić większej ilości niż dostępna.");
                    return;
                  }
                  await apiFetch("/api/orders", {
                    method: "POST",
                    body: JSON.stringify({ offer_id: Number(offer.id), quantity: parsedQty }),
                  });
                  alert("Order placed");
                  window.location.href = "/orders";
                } catch (e: any) {
                  const message = e?.message || "Nie udało się złożyć zamówienia.";
                  setError(message);
                } finally {
                  setSubmitting(false);
                }
              }}
              className="btn"
              disabled={submitting || !canOrder}
            >
              {submitting ? "Przetwarzam..." : orderCtaLabel}
            </button>
            <Link href={`/offers/${offer.id}/negotiate`} className="btn btn--ghost">
              Negocjuj
            </Link>
            <Link href="/offers" className="btn btn--ghost">
              Wróć do listy
            </Link>
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>
      </div>
    </section>
  );
}
