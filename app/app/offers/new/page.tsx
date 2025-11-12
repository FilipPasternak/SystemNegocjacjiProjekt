"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { offerSchema } from "@/lib/zod";
import { apiFetch } from "@/lib/api";

export default function NewOfferPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(offerSchema),
    defaultValues: { active: true }
  });

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">Create Offer</h1>
      <form
        onSubmit={handleSubmit(async (values: any) => {
          await apiFetch("/api/offers", { method: "POST", body: JSON.stringify(values) });
          alert("Offer created");
          window.location.href = "/producer/my-offers";
        })}
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        <input placeholder="product_name" className="border p-2 rounded" {...register("product_name")} />
        <input placeholder="product_category" className="border p-2 rounded" {...register("product_category")} />
        <input placeholder="sku (optional)" className="border p-2 rounded" {...register("sku")} />
        <input placeholder="location" className="border p-2 rounded" {...register("location")} />
        <input placeholder="quantity" type="number" className="border p-2 rounded" {...register("quantity")} />
        <select className="border p-2 rounded" {...register("unit_of_measure")}>
          <option value="kg">kg</option><option value="t">t</option><option value="pcs">pcs</option>
        </select>
        <input placeholder="unit_price" type="number" step="0.01" className="border p-2 rounded" {...register("unit_price")} />
        <select className="border p-2 rounded" {...register("currency")}>
          <option value="PLN">PLN</option><option value="EUR">EUR</option><option value="USD">USD</option>
        </select>
        <textarea placeholder="description (optional)" className="md:col-span-2 border p-2 rounded" {...register("description")} />
        <label className="flex items-center gap-2 md:col-span-2">
          <input type="checkbox" {...register("active")} /> Active
        </label>
        <div className="md:col-span-2">
          <button disabled={isSubmitting} className="bg-black text-white px-4 py-2 rounded">
            {isSubmitting ? "..." : "Create"}
          </button>
        </div>
      </form>
      {errors && <pre className="text-red-600 text-sm mt-3">{JSON.stringify(errors, null, 2)}</pre>}
    </div>
  );
}
