# devops-homelab

Lab portfolio junior DevOps: API Go di Docker, Kubernetes **lokal** (kind, gratis), dan resep Terraform AWS yang **belum di-apply**.

Image CD: `ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api` (`latest` dan `main-<sha>`).

## 1) ecommerce-api — Docker Compose lokal

```bash
cd ecommerce-api
cp .env.example .env
# set DB_PASSWORD, JWT_SECRET, METRICS_TOKEN (openssl rand -hex 32)
# Compose: DB_HOST=postgres (service name, bukan host.docker.internal)
docker compose up -d --build
curl -sf http://localhost:8080/live
curl -sf http://localhost:8080/ready
```

- API: http://localhost:8080
- Grafana: http://localhost:3000 (kredensial di `docker-compose.yml`, jangan diubah di git)
- Prometheus: http://localhost:9090
- Alertmanager: http://localhost:9093

CI di root `.github/workflows/`. CD push image ke GHCR setelah CI sukses.

## 2) k8s/ — kind (gratis, kerjakan dulu)

Prioritas lab: cluster Kubernetes di laptop, bukan AWS.

Langkah exact: lihat [`k8s/README.md`](./k8s/README.md).

```bash
kind create cluster --name ecommerce
cp k8s/base/secret.example.yaml k8s/base/secret.yaml
# edit secret.yaml lokal
kubectl apply -f k8s/base
kubectl -n ecommerce rollout status deploy/ecommerce-api
kubectl -n ecommerce port-forward svc/ecommerce-api 8080:8080
curl -sf http://127.0.0.1:8080/live
curl -sf http://127.0.0.1:8080/ready
kind delete cluster --name ecommerce
```

Tidak ada Ingress, Helm, operator, atau EKS.

## 3) infra/terraform — resep AWS (apply belakangan)

File Terraform di [`infra/terraform/`](./infra/terraform): VPC 2 AZ, EC2 t3.micro, **tanpa NAT Gateway**.

```bash
cd infra/terraform
terraform init
terraform validate
terraform plan   # perlu kredensial; JANGAN apply
```

`apply` membuat resource berbayar (EC2, EIP, VPC). Tunda sampai siap. Detail: [`infra/terraform/README.md`](./infra/terraform/README.md).
