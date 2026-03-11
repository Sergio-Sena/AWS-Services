output "db_instance_id" {
  description = "ID da instância RDS"
  value       = aws_db_instance.main.id
}

output "db_endpoint" {
  description = "Endpoint do banco de dados"
  value       = aws_db_instance.main.endpoint
}

output "db_name" {
  description = "Nome do banco de dados"
  value       = aws_db_instance.main.db_name
}

output "db_port" {
  description = "Porta do banco de dados"
  value       = aws_db_instance.main.port
}
