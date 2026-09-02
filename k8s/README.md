# Kubernetes (kind)

Manifest di folder ini dijalankan di klaster kind di laptop. Tidak memakai EKS, Helm, atau Ingress.

Image: `ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api` (`latest`, `main-<sha>`).

`ENVIRONMENT` di lab ini `staging`. Jangan set `production` selama `DB_SSLMODE=disable`.

## Prasyarat

- [kind](https://kind.sigs.k8s.io/)
- kubectl
- Docker

## Image

**Opsi A — tanpa GHCR (disarankan jika pull ditolak)**

```bash
docker build -t ecommerce-api:local ./ecommerce-api
kind load docker-image ecommerce-api:local --name ecommerce
```

Ganti `image` di `k8s/base/deployment.yaml` menjadi `ecommerce-api:local`.

**Opsi B — GHCR**

```bash
docker pull ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api:latest
```

Jika hasilnya `denied`, package masih private. Login ke `ghcr.io` atau pakai opsi A.

## Langkah

```bash
kind create cluster --name ecommerce
cp k8s/base/secret.example.yaml k8s/base/secret.yaml
```

Edit `secret.yaml` di laptop. `JWT_SECRET` dan `METRICS_TOKEN` minimal 32 karakter. File ini ada di `.gitignore`.

```bash
kubectl apply -f k8s/base
kubectl -n ecommerce rollout status deploy/ecommerce-api
kubectl -n ecommerce port-forward svc/ecommerce-api 8080:8080
curl -sf http://127.0.0.1:8080/live
curl -sf http://127.0.0.1:8080/ready
```

## Data Postgres

Postgres memakai `emptyDir` dan ConfigMap `postgres-init` (isi sama dengan `ecommerce-api/migrations/001_init.sql`). Data hilang jika pod dihapus.

Jika init SQL gagal:

```bash
kubectl -n ecommerce exec -i deploy/postgres -- psql -U postgres -d ecommerce < ecommerce-api/migrations/001_init.sql
```

## Hapus klaster

```bash
kind delete cluster --name ecommerce
```
