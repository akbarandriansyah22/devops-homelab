# devops-homelab

Lab portfolio for junior DevOps: containerized Go API, CI security scans, and a local observability stack.

## Projects

| Folder | What it is |
| --- | --- |
| [`ecommerce-api/`](./ecommerce-api) | Go e-commerce API + Docker + Prometheus/Grafana/Loki |

## Run the API stack

```bash
cd ecommerce-api
cp .env.example .env
# set DB_PASSWORD, JWT_SECRET, METRICS_TOKEN (openssl rand -hex 32)
# for Compose, set DB_HOST=postgres
docker compose up -d --build
curl http://localhost:8080/live
curl http://localhost:8080/ready
curl http://localhost:8080/health
```

- API: http://localhost:8080
- Grafana: http://localhost:3000 (admin / admin)
- Prometheus: http://localhost:9090
- Alertmanager: http://localhost:9093

CI runs on changes under `ecommerce-api/**`. CD publishes an image to GHCR after CI succeeds.
