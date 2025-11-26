"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const NAV_LINKS = [
  { href: "/offers", label: "Oferty" },
  { href: "/offers/new", label: "Dodaj ofertę" },
  { href: "/orders", label: "Moje zamówienia" },
  { href: "/producer/my-offers", label: "Oferty producenta" },
];

const AUTH_LINKS = [
  { href: "/auth/login", label: "Zaloguj" },
  { href: "/auth/register", label: "Zarejestruj" },
];

export function Header() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const allLinks = useMemo(() => [...NAV_LINKS, ...AUTH_LINKS], []);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const initialTheme = (stored as "light" | "dark" | null) || (prefersLight ? "light" : "dark");
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme === "light" ? "light" : "dark");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  return (
    <header className="nav">
      <div className="nav__inner">
        <Link href="/offers" className="brand" onClick={closeDrawer}>
          <span className="brand__logo" aria-hidden />
          <span className="brand__text">System Negocjacji</span>
        </Link>

        <nav className="nav__links" aria-label="Główne linki">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={closeDrawer}>
              {link.label}
            </Link>
          ))}
          <div className="theme">
            <span className="muted text-sm">Motyw</span>
            <button
              type="button"
              className="switch"
              aria-label="Przełącz motyw"
              data-checked={theme === "light"}
              onClick={toggleTheme}
            >
              <span className="switch__dot" />
            </button>
          </div>
          <Link href="/auth/login" className="btn btn--ghost" onClick={closeDrawer}>
            Zaloguj
          </Link>
          <Link href="/auth/register" className="btn" onClick={closeDrawer}>
            Rejestracja
          </Link>
        </nav>

        <button className="nav__menuBtn" onClick={() => setDrawerOpen(true)} aria-label="Otwórz menu">
          <span>Menu</span>
        </button>
      </div>

      <div className="drawer" data-open={drawerOpen}>
        <div className="flex items-center justify-between mb-2">
          <div className="brand">
            <span className="brand__logo" aria-hidden />
            <span className="brand__text">System</span>
          </div>
          <button className="nav__menuBtn" onClick={closeDrawer} aria-label="Zamknij menu">
            Zamknij
          </button>
        </div>
        {allLinks.map((link) => (
          <Link key={link.href} href={link.href} onClick={closeDrawer}>
            {link.label}
          </Link>
        ))}
        <div className="divider" />
        <div className="theme">
          <span className="muted text-sm">Motyw</span>
          <button
            type="button"
            className="switch"
            aria-label="Przełącz motyw"
            data-checked={theme === "light"}
            onClick={toggleTheme}
          >
            <span className="switch__dot" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
