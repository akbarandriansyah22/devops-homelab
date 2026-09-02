<div align="center">

# devops-homelab

API e-commerce Go dipakai untuk latihan Docker, CI/CD ke GHCR, Kubernetes (kind), dan Terraform di AWS.

[![CI](https://img.shields.io/github/actions/workflow/status/akbarandriansyah22/devops-homelab/ci.yml?branch=main&label=CI&logo=github&logoColor=white)](https://github.com/akbarandriansyah22/devops-homelab/actions/workflows/ci.yml)
[![GHCR](https://img.shields.io/github/actions/workflow/status/akbarandriansyah22/devops-homelab/cd.yml?branch=main&label=GHCR%20publish&logo=docker&logoColor=white)](https://github.com/akbarandriansyah22/devops-homelab/actions/workflows/cd.yml)
[![Go](https://img.shields.io/badge/Go-1.25.2-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

</div>

## Isi repo

| Folder | Isi |
| --- | --- |
| [`ecommerce-api/`](./ecommerce-api) | API Go (Fiber) + Postgres + Compose + Prometheus/Grafana/Loki |
| [`k8s/`](./k8s) | Manifest kind |
| [`infra/terraform/`](./infra/terraform) | VPC 2 AZ, security group, satu EC2 `t3.micro` + EIP (`ap-southeast-1`) |
| [`.github/workflows/`](./.github/workflows) | CI dan publish image ke GHCR |

Image: `ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api` (`latest`, `main-<sha>`).

Endpoint, schema, dan env API: [`ecommerce-api/README.md`](./ecommerce-api/README.md).

## Stack

Go 1.25.2, Fiber, PostgreSQL 16, Docker Compose, kind, Terraform, GitHub Actions, Prometheus, Grafana, Loki.

## Cara jalan

Butuh Docker. kind dan Terraform hanya kalau mau bagian itu.

```bash
git clone https://github.com/akbarandriansyah22/devops-homelab.git
cd devops-homelab/ecommerce-api
cp .env.example .env
```

Isi `DB_PASSWORD`, `JWT_SECRET`, `METRICS_TOKEN` (contoh `openssl rand -hex 32`). `DB_HOST=postgres`.

```bash
docker compose up -d --build
curl -sf http://localhost:8080/live
curl -sf http://localhost:8080/ready
```

| Service | URL |
| --- | --- |
| API | http://localhost:8080 |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Alertmanager | http://localhost:9093 |

Grafana: lihat `ecommerce-api/docker-compose.yml`.

### kind

Panduan: [`k8s/README.md`](./k8s/README.md). Kalau `docker pull` GHCR gagal (`denied`), build di laptop lalu `kind load`.

```bash
kind create cluster --name ecommerce
cp k8s/base/secret.example.yaml k8s/base/secret.yaml
kubectl apply -f k8s/base
kubectl -n ecommerce port-forward svc/ecommerce-api 8080:8080
curl -sf http://127.0.0.1:8080/live
```

### Terraform

Kode: [`infra/terraform/`](./infra/terraform). Default `plan` — belum membuat resource di AWS.

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform validate
terraform plan
```

`apply` membuat EC2, EBS, dan IP publik (ada biaya). Destroy: lihat README di folder itu.

## CI/CD

- CI (`Go CI + DevSecOps Pipeline`) — perubahan di `ecommerce-api/**` atau file workflow.
- CD (`Publish image to GHCR`) — push `main` ke path yang sama, atau **Run workflow**. CD tidak nunggu CI.

```bash
docker pull ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api:latest
```

Kalau dapat `denied`, package masih private. Login `ghcr.io` atau ubah visibility.

## Keputusan

- Kubernetes di kind, bukan EKS — control plane EKS berbayar per jam.
- EC2 di subnet publik, tanpa NAT — NAT Gateway sendiri sudah mahal untuk lab.
- Image bisa di-load ke kind tanpa GHCR — package baru default-nya private.

Tidak ada EKS, NAT Gateway, RDS, ALB, Ingress, Helm.

## File lokal

| File | Template |
| --- | --- |
| `ecommerce-api/.env` | `.env.example` |
| `k8s/base/secret.yaml` | `k8s/base/secret.example.yaml` |
| `infra/terraform/terraform.tfvars` | `terraform.tfvars.example` |

State Terraform (`*.tfstate`) juga tetap di laptop.

## License

MIT. [`LICENSE`](./LICENSE).
