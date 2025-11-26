"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { offerSchema } from "@/lib/zod";
import { apiFetch } from "@/lib/api";

export default function NewOfferPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(offerSchema),
    defaultValues: { active: true },
  });

  return (
    <section>
      <div className="container grid">
        <div className="badge">Dodaj nową ofertę</div>
        <div className="contact__card">
          <div className="headline" style={{ fontSize: "1.8rem", margin: 0 }}>
            Stwórz ogłoszenie sprzedaży
          </div>
          <p className="sub" style={{ fontSize: "1rem" }}>
            Uzupełnij kluczowe informacje o produkcie. Wszystkie pola zostały zweryfikowane przez schemat Zod, dzięki czemu dane
            pozostaną spójne.
          </p>

          <form
            onSubmit={handleSubmit(async (values: any) => {
              await apiFetch("/api/offers", { method: "POST", body: JSON.stringify(values) });
              alert("Offer created");
              reset({ ...values, active: values.active });
              window.location.href = "/producer/my-offers";
            })}
            className="form-grid"
            style={{ marginTop: 20 }}
          >
            <input placeholder="Nazwa produktu" className="input" {...register("product_name")} />
            <input placeholder="Kategoria" className="input" {...register("product_category")} />
            <input placeholder="SKU (opcjonalnie)" className="input" {...register("sku")} />
            <input placeholder="Lokalizacja" className="input" {...register("location")} />
            <input placeholder="Ilość" type="number" className="input" {...register("quantity")} />
            <select className="input" {...register("unit_of_measure")}>
              <option value="kg">kg</option>
              <option value="t">t</option>
              <option value="pcs">pcs</option>
            </select>
            <input placeholder="Cena jednostkowa" type="number" step="0.01" className="input" {...register("unit_price")} />
            <select className="input" {...register("currency")}>
              <option value="PLN">PLN</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
            <textarea placeholder="Opis (opcjonalny)" className="input" {...register("description")} />
            <label className="flex items-center gap-2" style={{ gridColumn: "1 / -1" }}>
              <input type="checkbox" {...register("active")} /> Aktywna oferta
            </label>
            <div style={{ gridColumn: "1 / -1" }} className="hero__cta">
              <button disabled={isSubmitting} className="btn">
                {isSubmitting ? "Przetwarzanie..." : "Opublikuj"}
              </button>
            </div>
          </form>
          {errors && <pre className="text-red-500 text-sm mt-3">{JSON.stringify(errors, null, 2)}</pre>}
        </div>
      </div>
    </section>
  );
}
