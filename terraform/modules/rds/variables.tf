variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente"
  type        = string
}

variable "vpc_id" {
  description = "ID da VPC"
  type        = string
}

variable "private_subnet_ids" {
  description = "IDs das subnets privadas"
  type        = list(string)
}

variable "eks_security_group_id" {
  description = "Security group do EKS"
  type        = string
}

variable "engine_version" {
  description = "Versão do PostgreSQL"
  type        = string
  default     = "15.4"
}

variable "instance_class" {
  description = "Classe da instância RDS"
  type        = string
  default     = "db.t3.micro"
}

variable "allocated_storage" {
  description = "Storage alocado (GB)"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Storage máximo (GB)"
  type        = number
  default     = 100
}

variable "database_name" {
  description = "Nome do banco de dados"
  type        = string
  default     = "awsservices"
}

variable "master_username" {
  description = "Username master"
  type        = string
  default     = "admin"
}

variable "master_password" {
  description = "Password master"
  type        = string
  sensitive   = true
}

variable "multi_az" {
  description = "Habilitar Multi-AZ"
  type        = bool
  default     = false
}

variable "backup_retention_period" {
  description = "Período de retenção de backup (dias)"
  type        = number
  default     = 7
}
