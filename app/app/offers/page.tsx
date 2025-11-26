"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function OffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [stats, setStats] = useState<{ active_offers: number; producers: number; buyers: number } | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [min_price, setMin] = useState("");
  const [max_price, setMax] = useState("");
  const [location, setLocation] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (min_price) params.set("min_price", min_price);
    if (max_price) params.set("max_price", max_price);
    if (location) params.set("location", location);
    params.set("active", "true");
    const data = await apiFetch(`/api/offers?${params.toString()}`);
    setOffers(data);
  }

  async function loadStats() {
    const data = await apiFetch<{ active_offers: number; producers: number; buyers: number }>("/api/stats/overview");
    setStats(data);
  }

  useEffect(() => {
    load();
    loadStats();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero__inner">
            <div>
              <div className="badge">Oferty producentów</div>
              <h1 className="headline">
                Wybierz <span className="headline__gradient">najlepszą ofertę</span> dla swojego biznesu
              </h1>
              <div className="hero__cta">
                <button onClick={load} className="btn">
                  Odśwież wyniki
                </button>
                <Link href="/offers/new" className="btn btn--ghost">
                  Dodaj ofertę
                </Link>
              </div>
            </div>
            <div className="device">
              <div className="device__glow" />
              <div className="device__grid" />
              <div className="device__card">
                <div className="pill">Podsumowanie</div>
                <h4>Rynek w liczbach</h4>
                <div className="device__stats">
                  <div className="device__stat">
                    <div className="device__stat-label muted">Aktywne oferty</div>
                    <div className="device__stat-value">{stats ? stats.active_offers : "..."}</div>
                  </div>
                  <div className="device__stat">
                    <div className="device__stat-label muted">Konta producentów</div>
                    <div className="device__stat-value">{stats ? stats.producers : "..."}</div>
                  </div>
                  <div className="device__stat">
                    <div className="device__stat-label muted">Konta kupujących</div>
                    <div className="device__stat-value">{stats ? stats.buyers : "..."}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container grid">
          <div className="card">
            <div className="badge">Filtry</div>
            <div className="form-grid">
              <input placeholder="Szukaj po nazwie" className="input" value={q} onChange={(e) => setQ(e.target.value)} />
              <input placeholder="Kategoria" className="input" value={category} onChange={(e) => setCategory(e.target.value)} />
              <input
                placeholder="Cena minimalna"
                className="input"
                value={min_price}
                onChange={(e) => setMin(e.target.value)}
              />
              <input
                placeholder="Cena maksymalna"
                className="input"
                value={max_price}
                onChange={(e) => setMax(e.target.value)}
              />
              <input placeholder="Lokalizacja" className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="hero__cta" style={{ marginTop: 16 }}>
              <button onClick={load} className="btn">
                Filtruj oferty
              </button>
              <button
                onClick={() => {
                  setQ("");
                  setCategory("");
                  setMin("");
                  setMax("");
                  setLocation("");
                  load();
                }}
                className="btn btn--ghost"
              >
                Wyczyść
              </button>
            </div>
          </div>

          <div className="grid" style={{ gap: 16 }}>
            <div className="products__grid">
              {offers.map((o) => (
                <Link key={o.id} href={`/offers/${o.id}`} className="product-card">
                  <div className="product-card__image">{o.product_category}</div>
                  <div className="product-card__body">
                    <div className="product-card__title">{o.product_name}</div>
                    <div className="product-card__meta">
                      <span>{o.location}</span>
                      <span className="product-card__price">
                        {o.unit_price} {o.currency}
                      </span>
                    </div>
                    <div className="muted text-sm">Dostępna ilość: {o.quantity}</div>
                    <div className="product-card__cta">
                      <span className="pill">{o.unit_of_measure}</span>
                      <span className="pill">Szczegóły</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {!offers.length && <div className="muted">Brak ofert spełniających kryteria.</div>}
          </div>
        </div>
      </section>
    </>
  );
}
