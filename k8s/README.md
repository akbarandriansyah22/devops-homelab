# Kubernetes (kind)

Manifest di folder ini dijalankan di klaster kind di laptop. Tidak memakai EKS atau Helm.

Image: `ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api` (`latest`, `main-<sha>`).

`ENVIRONMENT` di lab ini `staging`. Jangan set `production` selama `DB_SSLMODE=disable`.

## Prasyarat

- [kind](https://kind.sigs.k8s.io/)
- kubectl
- Docker
- openssl (untuk TLS lab)

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

Klaster harus memakai `k8s/kind-config.yaml` agar port 80/443 di-map ke Ingress.

```bash
kind delete cluster --name ecommerce
kind create cluster --name ecommerce --config k8s/kind-config.yaml
cp k8s/base/secret.example.yaml k8s/base/secret.yaml
```

Edit `secret.yaml` di laptop. `JWT_SECRET` dan `METRICS_TOKEN` minimal 32 karakter. File ini ada di `.gitignore`.

```bash
kubectl apply -f k8s/base
kubectl -n ecommerce rollout status deploy/ecommerce-api
```

Port-forward tetap tersedia sebagai fallback:

```bash
kubectl -n ecommerce port-forward svc/ecommerce-api 8080:8080
curl -sf http://127.0.0.1:8080/live
```

## Ingress + TLS

PKI lab: root CA (5 tahun) menandatangani leaf `ecommerce.local` (90 hari). File kunci tidak di-commit.

```bash
bash k8s/tls/generate-certs.sh

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.2/deploy/static/provider/kind/deploy.yaml
kubectl -n ingress-nginx rollout status deploy/ingress-nginx-controller

kubectl -n ecommerce create secret tls ecommerce-tls \
  --cert=k8s/tls/ecommerce.local.crt \
  --key=k8s/tls/ecommerce.local.key \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl apply -f k8s/ingress/ingress.yaml
```

Tambahkan host lokal (sekali):

```bash
grep -q 'ecommerce.local' /etc/hosts || echo '127.0.0.1 ecommerce.local' | sudo tee -a /etc/hosts
```

Verifikasi TLS (percayai CA lab, bukan skip verify buta):

```bash
curl -sf --cacert k8s/tls/lab-ca.crt https://ecommerce.local/live
```

### Daur hidup sertifikat

| Objek | Masa berlaku | Kapan diganti |
| --- | --- | --- |
| `k8s/tls/lab-ca.crt` | 5 tahun | Hanya jika CA hilang atau dikompromikan |
| `k8s/tls/ecommerce.local.crt` | 90 hari | `bash k8s/tls/generate-certs.sh` lalu apply ulang Secret |

Renewal leaf tidak memutar CA. Setelah generate ulang:

```bash
kubectl -n ecommerce create secret tls ecommerce-tls \
  --cert=k8s/tls/ecommerce.local.crt \
  --key=k8s/tls/ecommerce.local.key \
  --dry-run=client -o yaml | kubectl apply -f -
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
