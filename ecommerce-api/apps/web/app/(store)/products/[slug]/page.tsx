import Link from "next/link";
import { AddToCart } from "@/components/cart/add-to-cart";
import { getProductBySlug } from "@/lib/api";
import { getSession } from "@/lib/auth";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [result, session] = await Promise.all([getProductBySlug(slug), getSession()]);

  if (result.error !== null) {
    return (
      <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {result.error ?? "Produk tidak ditemukan."}
      </p>
    );
  }

  const product = result.data;

  return (
    <article className="space-y-3 rounded border border-neutral-200 bg-white p-4">
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className="max-h-64 w-full object-contain" />
      ) : null}
      <h1 className="text-2xl font-semibold">{product.name}</h1>
      <p className="text-neutral-700">{product.description || "Tidak ada deskripsi."}</p>
      <p>{formatPrice(product.price)}</p>
      <p className="text-sm text-neutral-600">Stok: {product.stock}</p>
      <p className="text-sm text-neutral-600">SKU: {product.sku || "—"}</p>
      {session ? (
        <AddToCart productId={product.id} />
      ) : (
        <Link href="/login" className="inline-block rounded bg-neutral-900 px-3 py-1.5 text-sm text-white">
          Tambah ke keranjang
        </Link>
      )}
    </article>
  );
}
