# Kubernetes lokal (kind)

Cluster **gratis** di mesin sendiri. Tidak memakai EKS, Helm, Ingress, atau addon berbayar.

Image CD: `ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api` (`latest` dan `main-<sha>`).

Lab memakai `ENVIRONMENT=staging` (bukan `production`) agar `DB_SSLMODE=disable` tidak fatal.

## Prasyarat

- [kind](https://kind.sigs.k8s.io/)
- kubectl
- Docker

## Langkah

```bash
kind create cluster --name ecommerce

# opsi A: build lokal lalu
# docker build -t ecommerce-api:local ./ecommerce-api
# kind load docker-image ecommerce-api:local --name ecommerce
# lalu ganti image di k8s/base/deployment.yaml ke ecommerce-api:local
# opsi B: pull GHCR jika image publik / sudah docker login

cp k8s/base/secret.example.yaml k8s/base/secret.yaml
# user edit secret.yaml lokal (JWT_SECRET dan METRICS_TOKEN >= 32 karakter)

kubectl apply -f k8s/base
kubectl -n ecommerce rollout status deploy/ecommerce-api
kubectl -n ecommerce port-forward svc/ecommerce-api 8080:8080
curl -sf http://127.0.0.1:8080/live
curl -sf http://127.0.0.1:8080/ready
kind delete cluster --name ecommerce
```

`k8s/base/secret.yaml` diabaikan git. Jangan commit secret asli.

Postgres lab memakai `emptyDir` dan ConfigMap `postgres-init` (isi sama dengan `ecommerce-api/migrations/001_init.sql`). Data hilang saat pod dihapus.

Jika init SQL gagal, apply manual:

```bash
kubectl -n ecommerce exec -i deploy/postgres -- psql -U postgres -d ecommerce < ecommerce-api/migrations/001_init.sql
```

## Hapus cluster

```bash
kind delete cluster --name ecommerce
```
