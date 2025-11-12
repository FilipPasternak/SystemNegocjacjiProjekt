"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useSearchParams, useParams } from "next/navigation";

export default function OfferDetails() {
  const params = useParams<{ id: string }>();
  const [offer, setOffer] = useState<any>(null);
  const [qty, setQty] = useState("1");

  useEffect(() => {
    apiFetch(`/api/offers/${params.id}`).then(setOffer);
  }, [params.id]);

  if (!offer) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow space-y-3">
      <h1 className="text-xl font-semibold">{offer.product_name}</h1>
      <div className="text-sm text-slate-600">{offer.product_category} • {offer.location}</div>
      <div>{offer.unit_price} {offer.currency} / {offer.unit_of_measure}</div>
      <div className="text-sm">Available: {offer.quantity}</div>
      <p className="text-slate-700">{offer.description}</p>

      <div className="pt-4 border-t">
        <label className="block text-sm mb-1">Order quantity</label>
        <input type="number" className="border p-2 rounded w-40" value={qty} onChange={e=>setQty(e.target.value)} />
        <button
          onClick={async () => {
            try{
              await apiFetch("/api/orders", {
                method: "POST",
                body: JSON.stringify({ offer_id: Number(offer.id), quantity: Number(qty) })
              });
              alert("Order placed");
              window.location.href = "/orders";
            } catch (e:any) {
              alert(e.message);
            }
          }}
          className="ml-3 bg-black text-white px-4 py-2 rounded"
        >
          Order
        </button>
      </div>
    </div>
  );
}
