import type { ApiEnvelope, Category, Product, ProductListResponse } from "./types";

export type CatalogResult<T> = { data: T; error: null } | { data: null; error: string };

function apiBase(): string {
  return process.env.API_URL ?? "http://localhost:8080";
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { error: text };
  }
}

function errorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const record = body as { error?: unknown; message?: unknown };
    if (typeof record.error === "string" && record.error) return record.error;
    if (typeof record.message === "string" && record.message) return record.message;
  }
  return fallback;
}

export async function getProducts(): Promise<
  CatalogResult<{ items: Product[]; total: number }>
> {
  try {
    const res = await fetch(`${apiBase()}/api/products?page=1&limit=100`, {
      cache: "no-store",
    });
    const body = await readJson(res);
    if (!res.ok) {
      return { data: null, error: errorMessage(body, `Produk gagal dimuat (${res.status})`) };
    }
    const page = body as ProductListResponse;
    const items = Array.isArray(page?.data) ? page.data : [];
    return { data: { items, total: typeof page?.total === "number" ? page.total : items.length }, error: null };
  } catch {
    return { data: null, error: "API produk tidak terjangkau. Pastikan server berjalan di API_URL." };
  }
}

export async function getProductBySlug(slug: string): Promise<CatalogResult<Product>> {
  try {
    const res = await fetch(`${apiBase()}/api/products/slug/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    const body = await readJson(res);
    if (!res.ok) {
      return { data: null, error: errorMessage(body, `Produk tidak ditemukan (${res.status})`) };
    }
    const product = body as Product;
    if (!product || typeof product.id !== "number") {
      return { data: null, error: errorMessage(body, "Respons produk tidak valid") };
    }
    return { data: product, error: null };
  } catch {
    return { data: null, error: "API produk tidak terjangkau. Pastikan server berjalan di API_URL." };
  }
}

export async function getCategories(): Promise<CatalogResult<Category[]>> {
  try {
    const res = await fetch(`${apiBase()}/api/categories`, { cache: "no-store" });
    const body = await readJson(res);
    if (!res.ok) {
      return { data: null, error: errorMessage(body, `Kategori gagal dimuat (${res.status})`) };
    }
    const envelope = body as ApiEnvelope<Category[]>;
    if (!envelope?.success) {
      return { data: null, error: errorMessage(body, "Kategori gagal dimuat") };
    }
    return { data: Array.isArray(envelope.data) ? envelope.data : [], error: null };
  } catch {
    return { data: null, error: "API kategori tidak terjangkau. Pastikan server berjalan di API_URL." };
  }
}
