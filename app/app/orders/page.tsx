"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(()=>{ apiFetch("/api/orders/mine").then(setOrders).catch(()=>setOrders([])); },[]);
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">My Orders</h1>
      <div className="space-y-3">
        {orders.map(o=>(
          <div key={o.id} className="bg-white p-4 rounded-xl shadow">
            <div className="font-medium">Order #{o.id}</div>
            <div className="text-sm text-slate-600">offer_id: {o.offer_id}</div>
            <div>qty: {o.quantity} • price: {o.unit_price_snapshot}</div>
            <div className="text-sm">status: {o.status}</div>
          </div>
        ))}
        {!orders.length && <div className="text-slate-600">No orders yet.</div>}
      </div>
    </div>
  );
}
