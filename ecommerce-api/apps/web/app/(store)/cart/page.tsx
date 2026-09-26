import Link from "next/link";
import { redirect } from "next/navigation";
import { RemoveItem } from "@/components/cart/remove-item";
import { getSession } from "@/lib/auth";
import { getCart } from "@/lib/shop";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
}

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login");

  const result = await getCart();
  if (result.error !== null) {
    return <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{result.error}</p>;
  }

  const items = result.data.items ?? [];
  if (items.length === 0) {
    return (
      <section className="space-y-2">
        <h1 className="text-xl font-semibold">Keranjang</h1>
        <p className="text-sm text-neutral-600">Keranjang kosong.</p>
        <Link href="/" className="text-sm underline">
          Lihat produk
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Keranjang</h1>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 rounded border border-neutral-200 bg-white p-4">
            <div>
              <Link href={`/products/${item.product.slug}`} className="font-medium underline">
                {item.product.name}
              </Link>
              <p className="text-sm">Qty: {item.quantity}</p>
              <p className="text-sm">{formatPrice(item.price)}</p>
            </div>
            <RemoveItem itemId={item.id} />
          </li>
        ))}
      </ul>
      <p>Total: {formatPrice(result.data.total_price)}</p>
      <Link href="/checkout" className="inline-block rounded bg-neutral-900 px-3 py-1.5 text-sm text-white">
        Checkout
      </Link>
    </section>
  );
}
