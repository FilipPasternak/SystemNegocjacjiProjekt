import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <header className="w-full border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link href="/offers" className="font-semibold">Producer–Buyer POC</Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/offers">Offers</Link>
              <Link href="/offers/new">New Offer</Link>
              <Link href="/orders">My Orders</Link>
              <Link href="/producer/my-offers">My Offers</Link>
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/register">Register</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
