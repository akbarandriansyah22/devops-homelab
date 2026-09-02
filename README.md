# devops-homelab

Lab portfolio junior DevOps. Bukan production.

| Layer | Isi | Status |
| --- | --- | --- |
| `ecommerce-api/` | API Go (Fiber) + Postgres + Compose + Prometheus/Grafana/Loki | jalan di laptop |
| `k8s/` | Manifest kind (Deployment, Service, Secret template) | lokal, gratis |
| `infra/terraform/` | VPC 2 AZ, SG, 1× EC2 `t3.micro` + EIP | `plan` saja, jangan `apply` dulu |
| `.github/workflows/` | CI (lint, gosec, trivy, test) + CD publish GHCR | CD terpisah dari CI |

Image CD: `ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api` (`latest`, `main-<sha>`).

Tidak ada EKS, NAT Gateway, RDS, ALB, Ingress, atau Helm.

## 1) Compose lokal

```bash
cd ecommerce-api
cp .env.example .env
# set DB_PASSWORD, JWT_SECRET, METRICS_TOKEN (openssl rand -hex 32)
# DB_HOST=postgres (nama service Compose, bukan host.docker.internal)
docker compose up -d --build
curl -sf http://localhost:8080/live
curl -sf http://localhost:8080/ready
```

- API: http://localhost:8080
- Grafana: http://localhost:3000 (kredensial di `docker-compose.yml`, jangan diubah di git)
- Prometheus: http://localhost:9090
- Alertmanager: http://localhost:9093

## 2) kind lokal

Langkah lengkap: [`k8s/README.md`](./k8s/README.md).

Kalau `docker pull` ke GHCR dapat `denied`, jangan pakai image registry. Build lokal lalu `kind load` (opsi A di `k8s/README.md`).

```bash
kind create cluster --name ecommerce
cp k8s/base/secret.example.yaml k8s/base/secret.yaml
# edit secret.yaml lokal (JWT_SECRET dan METRICS_TOKEN >= 32 karakter)
kubectl apply -f k8s/base
kubectl -n ecommerce rollout status deploy/ecommerce-api
kubectl -n ecommerce port-forward svc/ecommerce-api 8080:8080
curl -sf http://127.0.0.1:8080/live
curl -sf http://127.0.0.1:8080/ready
kind delete cluster --name ecommerce
```

`k8s/base/secret.yaml` tidak di-commit.

## 3) Terraform AWS — plan, bukan apply

Resep: [`infra/terraform/`](./infra/terraform). Region default `ap-southeast-1`. EC2 di public subnet + EIP. Private subnet ada, tanpa NAT.

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
# isi ssh_cidr, key_name, secret lokal — jangan commit terraform.tfvars
terraform init
terraform validate
terraform plan
```

`apply` membuat resource berbayar (EC2, EBS, public IPv4/EIP). Akun AWS 2026 memakai model kredit Free Tier baru; jangan anggap 12 bulan `t2.micro` otomatis. Estimasi Billing bisa telat ~24 jam. Siap `destroy` di hari yang sama sebelum `apply`.

## 4) CI / CD

- CI: `.github/workflows/ci.yml` — `Go CI + DevSecOps Pipeline`. Jalan pada perubahan `ecommerce-api/**` atau file workflow itu.
- CD: `.github/workflows/cd.yml` — `Publish image to GHCR`. Jalan pada **push `main`** ke `ecommerce-api/**` atau `cd.yml`, atau **Run workflow** di Actions. CD **tidak** menunggu CI.

Package GHCR pertama kali private. Pull tanpa login bisa `denied`. Bedakan dari image lama `backendproject_and_portofolio/e-commerce-api` (repo lain).

```bash
docker pull ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api:latest
```

## Yang tidak di-commit

`.env`, `terraform.tfvars`, `*.tfstate`, `k8s/base/secret.yaml`, token GHCR.
