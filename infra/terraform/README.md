# Terraform (resep AWS — jangan apply dulu)

File ini mendeskripsikan VPC + satu EC2 t3.micro + Docker (API + Postgres di host). **Tidak ada EKS, NAT Gateway, RDS, ALB, ASG.**

Image: `ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api:latest`

Private subnet **tidak** punya rute `0.0.0.0/0` (tidak ada NAT). EC2 lab duduk di **public** subnet + EIP.

## Perintah (tanpa apply)

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
# isi ssh_cidr, key_name, secret lokal — jangan commit terraform.tfvars

terraform init
terraform validate
terraform plan   # perlu kredensial AWS; JANGAN apply
```

`terraform apply` dan `terraform destroy` = langkah berikut, **berbayar**. Jangan jalankan sampai siap menanggung tagihan EC2/EIP/VPC.

Tanpa akun AWS, tetap `terraform init` + `terraform validate` jika binary Terraform terpasang.

## Catatan

- `ENVIRONMENT` default `staging` (lab). Jangan `production` + `DB_SSLMODE=disable`.
- Postgres di user_data **tidak** publish 5432 ke `0.0.0.0`.
- Login GHCR hanya jika `ghcr_username` + `ghcr_token` diisi di tfvars lokal.
