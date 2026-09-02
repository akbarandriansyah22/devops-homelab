# devops-homelab

Repositori ini adalah laboratorium portofolio DevOps. Isinya API e-commerce berbasis Go yang dijalankan sebagai kontainer, klaster Kubernetes lokal dengan kind, serta resep Terraform untuk jejaring VPC kecil di AWS.

Lingkupnya pembelajaran dan portofolio. Konfigurasi ini tidak dimaksudkan sebagai lingkungan produksi.

## Isi repositori

| Direktori | Fungsi |
| --- | --- |
| `ecommerce-api/` | API Go (Fiber), PostgreSQL, Docker Compose, dan tumpukan observabilitas lokal |
| `k8s/` | Manifest Kubernetes untuk klaster kind |
| `infra/terraform/` | VPC dua Availability Zone, security group, satu instans EC2 `t3.micro`, dan Elastic IP |
| `.github/workflows/` | CI (lint, SAST, pemindaian image, pengujian) dan CD (publikasi image ke GHCR) |

Image yang diterbitkan CD:

`ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api` (`latest` dan `main-<sha>`).

Komponen berikut sengaja tidak dipakai: EKS, NAT Gateway, RDS, ALB, Ingress, dan Helm.

## Menjalankan API secara lokal

```bash
cd ecommerce-api
cp .env.example .env
```

Isi `DB_PASSWORD`, `JWT_SECRET`, dan `METRICS_TOKEN` (contoh: `openssl rand -hex 32`). Untuk Compose, `DB_HOST` memakai nama service `postgres`.

```bash
docker compose up -d --build
curl -sf http://localhost:8080/live
curl -sf http://localhost:8080/ready
```

| Layanan | Alamat |
| --- | --- |
| API | http://localhost:8080 |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Alertmanager | http://localhost:9093 |

Kredensial Grafana terdapat di `ecommerce-api/docker-compose.yml`.

## Kubernetes (kind)

Dokumentasi langkah: [`k8s/README.md`](./k8s/README.md).

Jika image di GHCR belum dapat di-pull, bangun image di mesin lokal kemudian muat ke kind (`kind load`). Cara itu diuraikan sebagai opsi A pada berkas tersebut.

```bash
kind create cluster --name ecommerce
cp k8s/base/secret.example.yaml k8s/base/secret.yaml
```

Sunting `secret.yaml` di mesin lokal. Panjang `JWT_SECRET` dan `METRICS_TOKEN` minimal 32 karakter. Berkas itu tidak masuk git.

```bash
kubectl apply -f k8s/base
kubectl -n ecommerce rollout status deploy/ecommerce-api
kubectl -n ecommerce port-forward svc/ecommerce-api 8080:8080
curl -sf http://127.0.0.1:8080/live
curl -sf http://127.0.0.1:8080/ready
kind delete cluster --name ecommerce
```

## Infrastruktur AWS (Terraform)

Konfigurasi ada di [`infra/terraform/`](./infra/terraform). Wilayah bawaan: `ap-southeast-1`. Instans lab berada di subnet publik beserta Elastic IP. Subnet privat disediakan tanpa NAT Gateway.

Perintah tinjauan (tidak membuat sumber daya):

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform validate
terraform plan
```

`terraform.tfvars` hanya diisi di mesin lokal dan tidak di-commit. `terraform apply` membuat sumber daya berbayar (EC2, EBS, alamat IPv4 publik). Rincian dan prosedur pembongkaran ada di [`infra/terraform/README.md`](./infra/terraform/README.md).

## CI dan CD

- **CI** — `.github/workflows/ci.yml` (`Go CI + DevSecOps Pipeline`). Dipicu perubahan pada `ecommerce-api/**` atau berkas workflow terkait.
- **CD** — `.github/workflows/cd.yml` (`Publish image to GHCR`). Dipicu push ke `main` pada `ecommerce-api/**` atau `cd.yml`, serta tombol **Run workflow** di GitHub Actions. CD tidak menunggu hasil CI.

Paket Container Registry bersifat privat pada publikasi pertama. Pull tanpa autentikasi dapat ditolak. Setelah image tersedia:

```bash
docker pull ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api:latest
```

## Berkas yang tidak masuk git

`.env`, `terraform.tfvars`, `*.tfstate`, `k8s/base/secret.yaml`, dan token registri.

## Lisensi

MIT. Lihat [`LICENSE`](./LICENSE).
