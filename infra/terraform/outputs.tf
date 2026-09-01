output "vpc_id" {
  value = aws_vpc.lab.id
}

output "public_ip" {
  value = aws_eip.app.public_ip
}

output "instance_id" {
  value = aws_instance.app.id
}
