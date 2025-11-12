"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function OffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
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

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Offers</h1>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <input placeholder="q" className="border p-2 rounded" value={q} onChange={e=>setQ(e.target.value)} />
        <input placeholder="category" className="border p-2 rounded" value={category} onChange={e=>setCategory(e.target.value)} />
        <input placeholder="min price" className="border p-2 rounded" value={min_price} onChange={e=>setMin(e.target.value)} />
        <input placeholder="max price" className="border p-2 rounded" value={max_price} onChange={e=>setMax(e.target.value)} />
        <input placeholder="location" className="border p-2 rounded" value={location} onChange={e=>setLocation(e.target.value)} />
      </div>
      <button onClick={load} className="bg-black text-white px-4 py-2 rounded">Search</button>

      <div className="grid md:grid-cols-2 gap-4">
        {offers.map(o => (
          <a key={o.id} href={`/offers/${o.id}`} className="bg-white rounded-xl shadow p-4 hover:shadow-md">
            <div className="font-semibold">{o.product_name}</div>
            <div className="text-sm text-slate-600">{o.product_category} • {o.location}</div>
            <div className="mt-2">{o.unit_price} {o.currency} / {o.unit_of_measure}</div>
            <div className="text-sm text-slate-600">Qty: {o.quantity}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
