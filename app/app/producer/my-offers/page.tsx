"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function MyOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  useEffect(()=>{ apiFetch("/api/producer/my-offers").then(setOffers).catch(()=>setOffers([])); },[]);

  async function toggle(offer: any) {
    const res = await apiFetch(`/api/offers/${offer.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: !offer.active })
    });
    setOffers(prev => prev.map(o => o.id === res.id ? res : o));
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">My Offers</h1>
      <div className="space-y-3">
        {offers.map(o=>(
          <div key={o.id} className="bg-white p-4 rounded-xl shadow flex items-center justify-between">
            <div>
              <div className="font-medium">{o.product_name}</div>
              <div className="text-sm text-slate-600">active: {String(o.active)} • qty: {o.quantity} • {o.unit_price} {o.currency}</div>
            </div>
            <button onClick={()=>toggle(o)} className="px-3 py-1 rounded border">
              Toggle active
            </button>
          </div>
        ))}
        {!offers.length && <div className="text-slate-600">No offers yet.</div>}
      </div>
    </div>
  );
}
