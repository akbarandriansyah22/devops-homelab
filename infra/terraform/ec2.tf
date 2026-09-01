data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.app.id]
  key_name               = var.key_name != "" ? var.key_name : null

  user_data = templatefile("${path.module}/user_data.sh.tftpl", {
    ghcr_image     = var.ghcr_image
    environment    = var.environment
    db_name        = var.db_name
    db_user        = var.db_user
    db_password    = var.db_password
    jwt_secret     = var.jwt_secret
    metrics_token  = var.metrics_token
    ghcr_username  = var.ghcr_username
    ghcr_token     = var.ghcr_token
  })

  user_data_replace_on_change = true

  tags = {
    Name = "${local.project}-ec2"
  }
}

resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"

  tags = {
    Name = "${local.project}-eip"
  }
}
