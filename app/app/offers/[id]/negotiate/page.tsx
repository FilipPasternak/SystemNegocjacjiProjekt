"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { apiFetch, getUser } from "@/lib/api";

type NegotiationMessage = {
  id: number;
  sender_id: number;
  proposed_price?: number | null;
  message?: string | null;
  created_at: string;
};

type Negotiation = {
  id: number;
  offer_id: number;
  buyer_id: number;
  producer_id: number;
  status: "OPEN" | "ACCEPTED" | "REJECTED";
  agreed_price?: number | null;
  messages: NegotiationMessage[];
};

type Offer = {
  id: number;
  product_name: string;
  product_category: string;
  unit_price: number;
  currency: string;
  location: string;
};

export default function NegotiatePage() {
  const params = useParams<{ id: string }>();
  const user = getUser();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [negotiation, setNegotiation] = useState<Negotiation | null>(null);
  const [initialPrice, setInitialPrice] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch(`/api/offers/${params.id}`).then(setOffer);
    loadNegotiation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const lastPrice = useMemo(() => {
    if (!negotiation || !negotiation.messages.length) return "";
    const last = negotiation.messages[negotiation.messages.length - 1];
    return last.proposed_price ? String(last.proposed_price) : "";
  }, [negotiation]);

  useEffect(() => {
    if (!newPrice && lastPrice) {
      setNewPrice(lastPrice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negotiation]);

  async function loadNegotiation() {
    try {
      const existing = await apiFetch<Negotiation>(`/api/negotiations/for-offer/${params.id}`);
      setNegotiation(existing);
    } catch (e) {
      setNegotiation(null);
    }
  }

  async function startNegotiation() {
    if (!initialPrice) {
      alert("Podaj proponowaną cenę");
      return;
    }
    setSubmitting(true);
    try {
      const created = await apiFetch<Negotiation>("/api/negotiations", {
        method: "POST",
        body: JSON.stringify({
          offer_id: Number(params.id),
          proposed_price: Number(initialPrice),
          message,
        }),
      });
      setNegotiation(created);
      setNewPrice(initialPrice);
      setMessage("");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function sendMessage(status_update?: Negotiation["status"]) {
    if (!negotiation) return;
    if (negotiation.status !== "OPEN" && !status_update) return;
    setSubmitting(true);
    try {
      const body: any = { message };
      if (newPrice) body.proposed_price = Number(newPrice);
      if (status_update) body.status_update = status_update;
      const updated = await apiFetch<Negotiation>(`/api/negotiations/${negotiation.id}/messages`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setNegotiation(updated);
      setMessage("");
      if (updated.messages.length) {
        const last = updated.messages[updated.messages.length - 1];
        setNewPrice(last.proposed_price ? String(last.proposed_price) : "");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const statusLabel = {
    OPEN: "W toku",
    ACCEPTED: "Zaakceptowano",
    REJECTED: "Odrzucono",
  } as const;

  return (
    <section>
      <div className="container stack" style={{ gap: 24 }}>
        <div className="breadcrumb">
          <Link href="/offers">Oferty</Link> / <Link href={`/offers/${params.id}`}>Oferta #{params.id}</Link> / Negocjacje
        </div>
        {offer && (
          <div className="card" style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <div className="stack">
              <div className="pill">{offer.product_category}</div>
              <h3>{offer.product_name}</h3>
              <div className="muted">
                Cena katalogowa: {offer.unit_price} {offer.currency} • {offer.location}
              </div>
            </div>
            {negotiation && (
              <div className="stack" style={{ alignItems: "flex-end" }}>
                <span className="pill">Status: {statusLabel[negotiation.status]}</span>
                {negotiation.agreed_price && <span className="badge">Ustalona cena: {negotiation.agreed_price}</span>}
              </div>
            )}
          </div>
        )}

        {!user && <div className="muted">Zaloguj się, aby rozpocząć negocjacje.</div>}

        {!negotiation && user && (
          <div className="card stack" style={{ gap: 16 }}>
            <div className="badge">Rozpocznij negocjacje</div>
            <input
              type="number"
              className="input"
              placeholder="Twoja propozycja cenowa"
              value={initialPrice}
              onChange={(e) => setInitialPrice(e.target.value)}
            />
            <textarea
              className="input"
              placeholder="Dodatkowy komentarz (opcjonalnie)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="btn" onClick={startNegotiation} disabled={submitting}>
              {submitting ? "Wysyłanie..." : "Wyślij propozycję"}
            </button>
          </div>
        )}

        {negotiation && (
          <div className="grid" style={{ gap: 16 }}>
            <div className="card stack" style={{ gap: 12 }}>
              <div className="badge">Wiadomości</div>
              <div className="stack" style={{ gap: 12 }}>
                {negotiation.messages.map((m) => (
                  <div
                    key={m.id}
                    className="card"
                    style={{
                      alignSelf: m.sender_id === user?.id ? "flex-end" : "flex-start",
                      background: m.sender_id === user?.id ? "#0b1727" : undefined,
                      color: m.sender_id === user?.id ? "#f5f7fb" : undefined,
                      minWidth: "50%",
                    }}
                  >
                    <div className="muted text-sm">{m.sender_id === negotiation.buyer_id ? "Kupujący" : "Producent"}</div>
                    {m.proposed_price !== null && m.proposed_price !== undefined && (
                      <div className="product-card__title">Propozycja: {m.proposed_price}</div>
                    )}
                    {m.message && <div>{m.message}</div>}
                    <div className="muted text-xs">{new Date(m.created_at).toLocaleString()}</div>
                  </div>
                ))}
                {!negotiation.messages.length && <div className="muted">Brak wiadomości.</div>}
              </div>
            </div>

            <div className="card stack" style={{ gap: 12 }}>
              <div className="badge">Nowa wiadomość</div>
              <input
                type="number"
                className="input"
                placeholder="Nowa propozycja"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                disabled={negotiation.status !== "OPEN"}
              />
              <textarea
                className="input"
                placeholder="Dodaj komentarz"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={negotiation.status !== "OPEN"}
              />
              <div className="hero__cta" style={{ gap: 8, flexWrap: "wrap" }}>
                <button className="btn" onClick={() => sendMessage()} disabled={submitting || negotiation.status !== "OPEN"}>
                  {submitting ? "Wysyłanie..." : "Wyślij kontrofertę"}
                </button>
                {user?.id === negotiation.producer_id && (
                  <>
                    <button
                      className="btn btn--ghost"
                      onClick={() => sendMessage("ACCEPTED")}
                      disabled={submitting || negotiation.status !== "OPEN"}
                    >
                      Akceptuj cenę
                    </button>
                    <button
                      className="btn btn--ghost"
                      onClick={() => sendMessage("REJECTED")}
                      disabled={submitting || negotiation.status !== "OPEN"}
                    >
                      Odrzuć
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
