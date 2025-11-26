import "./globals.css";
import { Header } from "@/components/Header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nowoczesna platforma ofert",
  description: "Przeglądaj, twórz i negocjuj oferty w intuicyjnym, nowoczesnym interfejsie.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="main-shell">
        <Header />
        <main className="page-shell">{children}</main>
      </body>
    </html>
  );
}
