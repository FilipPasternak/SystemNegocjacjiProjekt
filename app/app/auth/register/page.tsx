"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/zod";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  return (
    <section>
      <div className="container grid" style={{ maxWidth: 520 }}>
        <div className="badge">Rejestracja</div>
        <div className="contact__card stack">
          <div className="headline" style={{ fontSize: "1.6rem", margin: 0 }}>
            Dołącz do platformy
          </div>
          <p className="muted">Utwórz konto producenta lub kupującego i zacznij zarządzać ogłoszeniami w nowoczesnym interfejsie.</p>
          <form
            onSubmit={handleSubmit(async (values: any) => {
              await apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(values) });
              alert("Registered. Now login.");
              window.location.href = "/auth/login";
            })}
            className="stack"
          >
            <div>
              <input placeholder="Email" className="input" {...register("email")} />
              {errors.email && <p className="text-red-500 text-sm">{`${errors.email.message}`}</p>}
            </div>
            <div>
              <input type="password" placeholder="Hasło" className="input" {...register("password")} />
              {errors.password && <p className="text-red-500 text-sm">{`${errors.password.message}`}</p>}
            </div>
            <div>
              <select className="input" {...register("role")}>
                <option value="PRODUCER">PRODUCER</option>
                <option value="BUYER">BUYER</option>
              </select>
            </div>
            <div className="hero__cta">
              <button disabled={isSubmitting} className="btn">
                {isSubmitting ? "Tworzenie..." : "Utwórz konto"}
              </button>
              <Link href="/auth/login" className="btn btn--ghost">
                Masz już konto?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
