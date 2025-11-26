"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/zod";
import { apiFetch, saveAuth } from "@/lib/api";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  return (
    <section>
      <div className="container grid" style={{ maxWidth: 520 }}>
        <div className="badge">Logowanie</div>
        <div className="contact__card stack">
          <div className="headline" style={{ fontSize: "1.6rem", margin: 0 }}>
            Witaj ponownie
          </div>
          <p className="muted">
            Zaloguj się, aby śledzić zamówienia i zarządzać ofertami. Wszystkie pola są walidowane po stronie klienta.
          </p>
          <form
            onSubmit={handleSubmit(async (values: any) => {
              const res = await apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify(values) });
              saveAuth(res.access_token, res.user);
              window.location.href = "/offers";
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
            <div className="hero__cta">
              <button disabled={isSubmitting} className="btn">
                {isSubmitting ? "Logowanie..." : "Zaloguj"}
              </button>
              <Link href="/auth/register" className="btn btn--ghost">
                Nie masz konta?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
