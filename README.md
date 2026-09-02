# devops-homelab

Repo lab untuk portofolio DevOps.

Isinya API e-commerce Go, Docker Compose, klaster Kubernetes lokal (kind), dan resep Terraform untuk VPC kecil di AWS. Ini lab, bukan production.

## Isi repo

| Folder | Isi |
| --- | --- |
| `ecommerce-api/` | API Go (Fiber), Postgres, Compose, Prometheus/Grafana/Loki |
| `k8s/` | Manifest untuk kind |
| `infra/terraform/` | VPC 2 AZ, security group, satu EC2 `t3.micro`, Elastic IP |
| `.github/workflows/` | CI (lint, SAST, scan, test) dan CD (push image ke GHCR) |

Image CD: `ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api` (`latest` dan `main-<sha>`).

Yang tidak ada di repo ini: EKS, NAT Gateway, RDS, ALB, Ingress, Helm.

## Jalankan API di laptop

```bash
cd ecommerce-api
cp .env.example .env
```

Isi `DB_PASSWORD`, `JWT_SECRET`, dan `METRICS_TOKEN`. Bisa pakai `openssl rand -hex 32`. Untuk Compose, set `DB_HOST=postgres`.

```bash
docker compose up -d --build
curl -sf http://localhost:8080/live
curl -sf http://localhost:8080/ready
```

| Layanan | URL |
| --- | --- |
| API | http://localhost:8080 |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Alertmanager | http://localhost:9093 |

User Grafana ada di `ecommerce-api/docker-compose.yml`.

## Kubernetes (kind)

Panduan lengkap ada di [`k8s/README.md`](./k8s/README.md).

Kalau `docker pull` dari GHCR gagal, build image di laptop lalu `kind load`. Itu opsi A di README kind.

```bash
kind create cluster --name ecommerce
cp k8s/base/secret.example.yaml k8s/base/secret.yaml
```

Edit `secret.yaml` di laptop. `JWT_SECRET` dan `METRICS_TOKEN` minimal 32 karakter. File ini tidak di-commit.

```bash
kubectl apply -f k8s/base
kubectl -n ecommerce rollout status deploy/ecommerce-api
kubectl -n ecommerce port-forward svc/ecommerce-api 8080:8080
curl -sf http://127.0.0.1:8080/live
curl -sf http://127.0.0.1:8080/ready
kind delete cluster --name ecommerce
```

## AWS (Terraform)

File ada di [`infra/terraform/`](./infra/terraform). Region default `ap-southeast-1`. EC2 ada di subnet publik + EIP. Subnet privat ada, tanpa NAT.

Cek dulu tanpa membuat resource:

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform validate
terraform plan
```

Isi `terraform.tfvars` di laptop, jangan di-commit. `terraform apply` akan membuat EC2, EBS, dan IP publik — itu berbayar. Cara destroy ada di [`infra/terraform/README.md`](./infra/terraform/README.md).

## CI dan CD

- CI: `.github/workflows/ci.yml` (`Go CI + DevSecOps Pipeline`). Jalan kalau ada perubahan di `ecommerce-api/**` atau file workflow-nya.
- CD: `.github/workflows/cd.yml` (`Publish image to GHCR`). Jalan saat push ke `main` di path yang sama, atau lewat **Run workflow**. CD tidak nunggu CI selesai.

Package GHCR default-nya private. Pull tanpa login bisa ditolak (`denied`). Kalau image sudah ada:

```bash
docker pull ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api:latest
```

## Jangan di-commit

`.env`, `terraform.tfvars`, `*.tfstate`, `k8s/base/secret.yaml`, token GHCR.

## Lisensi

MIT. Lihat [`LICENSE`](./LICENSE).
