<div align="center">

# devops-homelab

Lab portofolio DevOps: API Go, Kubernetes lokal (kind), dan resep Terraform AWS.

Built with Go · Docker · kind · Terraform · GitHub Actions

[![CI Pipeline](https://img.shields.io/github/actions/workflow/status/akbarandriansyah22/devops-homelab/ci.yml?branch=main&label=CI&logo=github&logoColor=white)](https://github.com/akbarandriansyah22/devops-homelab/actions/workflows/ci.yml)
[![GHCR](https://img.shields.io/github/actions/workflow/status/akbarandriansyah22/devops-homelab/cd.yml?branch=main&label=GHCR%20publish&logo=docker&logoColor=white)](https://github.com/akbarandriansyah22/devops-homelab/actions/workflows/cd.yml)
[![Go Version](https://img.shields.io/badge/Go-1.25.2-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

</div>

---

## Overview

Repo ini lab junior DevOps, bukan production.

API e-commerce (Go + Fiber + PostgreSQL) jalan di Docker. Klaster Kubernetes-nya di laptop pakai kind. Resep AWS-nya Terraform: VPC 2 AZ, satu EC2 `t3.micro`, tanpa NAT/EKS.

Dokumentasi API lengkap ada di [`ecommerce-api/README.md`](./ecommerce-api/README.md).

Image CD: `ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api` (`latest` dan `main-<sha>`).

---

## Technology Stack

| Teknologi | Fungsi |
| --- | --- |
| Go 1.25.2 + Fiber | API |
| PostgreSQL 16 | Database |
| Docker Compose | Jalanin API + observability di laptop |
| kind + kubectl | Kubernetes lokal |
| Terraform | Resep VPC/EC2 di AWS (`ap-southeast-1`) |
| GitHub Actions | CI (lint, SAST, Trivy, test) dan CD (push GHCR) |
| Prometheus / Grafana / Loki | Metrics dan log lokal |

Tidak dipakai: EKS, NAT Gateway, RDS, ALB, Ingress, Helm.

---

## Project Structure

```
devops-homelab/
|-- .github/workflows/
|   |-- ci.yml
|   |-- cd.yml
|-- ecommerce-api/
|   |-- docker-compose.yml
|   |-- Dockerfile
|   |-- migrations/
|   |-- monitoring/
|   |-- server/
|-- k8s/
|   |-- base/
|-- infra/terraform/
|-- README.md
|-- LICENSE
```

---

## Getting Started

### Prerequisites

- Docker dan Docker Compose
- kind + kubectl (untuk lab Kubernetes)
- Terraform (untuk `plan` AWS)
- Git

### 1. Clone

```bash
git clone https://github.com/akbarandriansyah22/devops-homelab.git
cd devops-homelab
```

### 2. Compose

```bash
cd ecommerce-api
cp .env.example .env
```

Isi `DB_PASSWORD`, `JWT_SECRET`, dan `METRICS_TOKEN` (minimal 32 karakter, contoh `openssl rand -hex 32`). `DB_HOST=postgres`.

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

User Grafana ada di `ecommerce-api/docker-compose.yml`.

### 3. kind

Langkah lengkap: [`k8s/README.md`](./k8s/README.md).

Kalau pull GHCR dapat `denied`, build lokal lalu `kind load` (opsi A di README itu).

```bash
kind create cluster --name ecommerce
cp k8s/base/secret.example.yaml k8s/base/secret.yaml
# edit secret.yaml di laptop (JWT_SECRET dan METRICS_TOKEN >= 32 karakter)
kubectl apply -f k8s/base
kubectl -n ecommerce rollout status deploy/ecommerce-api
kubectl -n ecommerce port-forward svc/ecommerce-api 8080:8080
curl -sf http://127.0.0.1:8080/live
curl -sf http://127.0.0.1:8080/ready
kind delete cluster --name ecommerce
```

`k8s/base/secret.yaml` tidak di-commit.

### 4. Terraform

File: [`infra/terraform/`](./infra/terraform). Region default `ap-southeast-1`.

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform validate
terraform plan
```

`terraform.tfvars` hanya di laptop. `apply` membuat EC2, EBS, dan IP publik (berbayar). Cara destroy ada di [`infra/terraform/README.md`](./infra/terraform/README.md).

---

## CI/CD

Workflow ada di root: `.github/workflows/ci.yml` dan `cd.yml`.

- **CI** (`Go CI + DevSecOps Pipeline`) jalan saat `ecommerce-api/**` atau file workflow berubah.
- **CD** (`Publish image to GHCR`) jalan saat push ke `main` di path itu, atau lewat **Run workflow**. CD tidak nunggu CI.

Package GHCR pertama kali private. Pull tanpa login bisa `denied`.

```bash
docker pull ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api:latest
```

---

## Jangan di-commit

`.env`, `terraform.tfvars`, `*.tfstate`, `k8s/base/secret.yaml`, token GHCR.

---

## License

MIT. Lihat [`LICENSE`](./LICENSE).
