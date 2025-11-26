"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    apiFetch("/api/orders/mine").then(setOrders).catch(() => setOrders([]));
  }, []);
  return (
    <section>
      <div className="container grid">
        <div className="badge">Twoje zamówienia</div>
        <div className="grid" style={{ gap: 16 }}>
          {orders.map((o) => (
            <div key={o.id} className="card">
              <div className="product-card__meta">
                <span>Order #{o.id}</span>
                <span className="pill">{o.status}</span>
              </div>
              <div className="muted text-sm">Oferta: {o.offer_id}</div>
              <div className="product-card__meta">
                <span>Ilość: {o.quantity}</span>
                <span className="product-card__price">{o.unit_price_snapshot}</span>
              </div>
            </div>
          ))}
          {!orders.length && <div className="muted">Nie masz jeszcze żadnych zamówień.</div>}
        </div>
      </div>
    </section>
  );
}
