"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/api";

type HomeUser = ReturnType<typeof getUser>;

export default function Home() {
  const [user, setUser] = useState<HomeUser>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <section className="hero">
      <div className="container">
        <div className="hero__inner">
          <div>
            <div className="badge">Platforma zakupowo-negocjacyjna</div>
            <h1 className="headline">
              {user ? (
                <>
                  Cześć <span className="headline__gradient">{user.email}</span>!
                </>
              ) : (
                <>
                  Zbuduj przewagę{" "}
                  <span className="headline__gradient">dzięki nowoczesnym ofertom</span>
                </>
              )}
            </h1>
            <p className="sub">
              {user
                ? "Jesteś zalogowany. Przejdź do ofert, złóż zamówienie lub dodaj własną propozycję sprzedaży."
                : "Przeglądaj, twórz i negocjuj oferty w intuicyjnym interfejsie. Zaloguj się, aby odblokować pełną funkcjonalność."}
            </p>
            <div className="hero__cta">
              <Link href="/offers" className="btn">
                Przeglądaj oferty
              </Link>
              {user ? (
                <Link href="/producer/my-offers" className="btn btn--ghost">
                  Zarządzaj ofertami
                </Link>
              ) : (
                <Link href="/auth/login" className="btn btn--ghost">
                  Zaloguj się
                </Link>
              )}
            </div>
          </div>
          <div className="device">
            <div className="device__glow" />
            <div className="device__grid" />
            <div className="device__card">
              <div className="pill">Status konta</div>
              <h4>{user ? "Gotowy do działania" : "Gość"}</h4>
              <p className="muted">
                {user
                  ? "Dane logowania zostały zapamiętane — możesz swobodnie przechodzić między stronami."
                  : "Zarejestruj konto kupującego lub producenta, aby składać zamówienia i publikować oferty."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
