# Terraform AWS

Kode di folder ini membuat VPC, dua subnet publik, dua subnet privat, security group, satu EC2 `t3.micro`, dan Elastic IP di `ap-southeast-1`.

Tidak ada EKS, NAT Gateway, RDS, ALB, atau ASG.

Image yang ditarik user-data: `ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api:latest`.

EC2 berada di subnet publik + EIP. Subnet privat tidak punya rute `0.0.0.0/0`.

## Plan

Butuh kredensial AWS untuk `plan`. Tanpa akun, `init` dan `validate` tetap bisa dijalankan.

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
```

Isi di `terraform.tfvars` (file ini tidak di-commit):

- `ssh_cidr` dan `allowed_app_cidr` — IP publik Anda `/32`
- `key_name` — key pair yang sudah ada di region yang sama
- `db_password`, `jwt_secret`, `metrics_token`
- `ghcr_username` dan `ghcr_token` jika image GHCR private

```bash
terraform init
terraform validate
terraform plan
```

## Apply dan destroy

`terraform apply` membuat resource berbayar: EC2, EBS, dan alamat IPv4 publik / EIP.

Setelah selesai lab:

```bash
terraform destroy
```

Pastikan EIP ikut terhapus. IP publik yang tertinggal tetap ditagih.

## Catatan

- `ENVIRONMENT` default `staging`. Jangan gabungkan `production` dengan `DB_SSLMODE=disable`.
- Postgres di EC2 tidak dipublish ke `0.0.0.0:5432`.
- Tanpa `ghcr_username` / `ghcr_token`, user-data hanya berhasil jika package GHCR public.
