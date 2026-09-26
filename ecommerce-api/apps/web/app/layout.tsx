import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getCart } from "@/lib/shop";
import "./globals.css";

export const metadata = {
  title: "SecureShop",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const cart = session ? await getCart() : null;
  const cartCount = cart && cart.error === null ? cart.data.total_quantity : 0;

  return (
    <html lang="id">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <span className="text-lg font-semibold">SecureShop</span>
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/" className="underline">
                Home
              </Link>
              <Link href="/cart" className="underline">
                Cart{cartCount > 0 ? ` (${cartCount})` : ""}
              </Link>
              {session ? (
                <>
                  <Link href="/account" className="underline">
                    {session.email}
                  </Link>
                  <form action="/api/auth/logout" method="post">
                    <button type="submit" className="underline">
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="underline">
                    Login
                  </Link>
                  <Link href="/register" className="underline">
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
