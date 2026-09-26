# web

Next.js App Router. Slice yang hidup: katalog, auth, keranjang, checkout, dan order customer. CRUD admin masih placeholder.

Cart dan order dari browser lewat `app/api/proxy/[...path]` (cookie `access_token` → `Authorization: Bearer`). Tidak ada route `/api/cart` terpisah.

## Alur uji order

1. Login `web-auth-slice@example.com` (customer). Password yang dipakai saat register slice auth: `Testpass1`.
2. Buka produk di katalog. Tanpa login, tombol keranjang mengarah ke `/login`.
3. Tambah ke keranjang (`POST /api/cart/items` dengan `product_id` dan `quantity`).
4. Buka `/cart`, lalu `/checkout`. Isi alamat, telepon, catatan, dan `payment_method` (`bank_transfer`, `credit_card`, `e_wallet`, atau `cod`). Submit membuat `POST /api/orders` dan pindah ke `/orders/[id]`.
5. `/orders` menampilkan daftar. Tombol batal hanya untuk status `pending` atau `paid`.

Katalog saat ini kosong (`GET /api/products` `total: 0`), jadi langkah 2 butuh satu produk aktif di database. `GET /api/cart` sebelum cart pernah dibuat membalas 500 `Failed to get cart`. Service `GetCart` juga mengembalikan `items: []` dan `total_quantity: 0` meskipun baris `cart_items` ada, jadi halaman keranjang mengikuti JSON itu. `shipping_phone` dikirim form, tetapi handler `POST /api/orders` tidak membaca field itu. Detail order tidak berisi array item. Hapus item memakai path nyata `DELETE /api/cart/items/:id`.

## Akun uji

Register lewat `/register` membuat customer (`role_id = 2`). Password mengikuti aturan API: minimal 8 karakter, ada huruf besar, huruf kecil, dan angka.

Admin tidak dibuat dari form. Setelah user ada, ubah role di database:

```sql
UPDATE users SET role_id = 1 WHERE email = 'alamat@example.com';
```

Lalu login lagi. `/admin` menolak session customer dengan teks Forbidden. Tanpa cookie, `/admin` diarahkan ke `/login`.

## Menjalankan

1. Jalankan API Go di `:8080`.
2. Dari repo:

```bash
cd apps/web && npm i && npm run dev
```

`API_URL` dibaca server component dari `.env.local` (contoh: `API_URL=http://localhost:8080`). Frontend memanggil API itu langsung, tanpa rewrite Next.

Role backend: `1` admin, `2` customer. Auth: JWT Bearer.

```
apps/web/
  app/
    layout.tsx
    globals.css
    page.tsx
    (auth)/login/page.tsx
    (auth)/register/page.tsx
    (store)/products/[slug]/page.tsx
    (store)/search/page.tsx
    (store)/cart/page.tsx
    (store)/checkout/page.tsx
    (store)/orders/page.tsx
    (store)/orders/[id]/page.tsx
    (store)/account/page.tsx
    (admin)/admin/page.tsx
    (admin)/admin/products/page.tsx
    (admin)/admin/categories/page.tsx
    (admin)/admin/orders/page.tsx
    api/auth/login/route.ts
    api/auth/logout/route.ts
    api/auth/register/route.ts
    api/proxy/[...path]/route.ts
  components/layout/
  components/products/
  components/cart/
  components/orders/
  components/admin/
  components/ui/
  hooks/
  lib/api.ts
  lib/auth.ts
  lib/types.ts
  public/
  Dockerfile
  .env.example
  next.config.ts
  package.json
  tsconfig.json
  README.md
```

## Halaman → endpoint

| Halaman | Endpoint backend |
| --- | --- |
| `/` | `GET /api/products`, `GET /api/categories` |
| `/login` | `POST /api/auth/login` |
| `/register` | `POST /api/auth/register` |
| `/products/[slug]` | `GET /api/products/slug/:slug` |
| `/search` | `GET /api/products/search?q=` |
| `/cart` | `GET/POST/DELETE /api/cart`, `POST/DELETE /api/cart/items` |
| `/checkout` | `POST /api/orders` |
| `/orders` | `GET /api/orders` |
| `/orders/[id]` | `GET /api/orders/:id`, `POST /api/orders/:id/cancel` |
| `/account` | `GET /api/auth/profile`, `PUT /api/auth/profile`, `PUT /api/auth/change-password` |
| `/admin` | `GET /api/admin/orders` |
| `/admin/products` | CRUD `/api/admin/products` |
| `/admin/categories` | CRUD `/api/admin/categories` |
| `/admin/orders` | `GET/PUT /api/admin/orders` |

Route BFF (`app/api/auth/*`, `app/api/proxy/[...path]`) masih kosong. Env: `API_URL=http://localhost:8080`.

Endpoint katalog lain yang belum punya halaman khusus: `GET /api/products/:id`, `GET /api/products/category/:id`, `GET /api/categories/:id`, `GET /api/categories/:id/products`, `GET /api/categories/:id/subcategories`.
