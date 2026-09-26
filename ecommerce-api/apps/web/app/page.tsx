import Link from "next/link";
import { getCategories, getProducts } from "@/lib/api";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function Page() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-3 text-xl font-semibold">Kategori</h1>
        {categories.error !== null ? (
          <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {categories.error}
          </p>
        ) : categories.data.length === 0 ? (
          <p className="text-sm text-neutral-600">Belum ada kategori.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {categories.data.map((category) => (
              <li key={category.id} className="rounded border border-neutral-300 bg-white px-3 py-1 text-sm">
                {category.name}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Produk</h2>
        {products.error !== null ? (
          <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {products.error}
          </p>
        ) : products.data.items.length === 0 ? (
          <p className="text-sm text-neutral-600">Belum ada produk.</p>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.data.items.map((product) => (
                <li key={product.id} className="rounded border border-neutral-200 bg-white p-4">
                  <Link href={`/products/${product.slug}`} className="font-medium underline">
                    {product.name}
                  </Link>
                  <p className="mt-2 text-sm">{formatPrice(product.price)}</p>
                  <p className="text-sm text-neutral-600">Stok: {product.stock}</p>
                </li>
              ))}
            </ul>
            {products.data.total > products.data.items.length ? (
              <p className="mt-3 text-sm text-neutral-600">
                Menampilkan {products.data.items.length} dari {products.data.total} produk.
              </p>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
