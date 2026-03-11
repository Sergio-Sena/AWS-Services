variable "aws_region" {
  description = "Região AWS"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nome do projeto"
  type        = string
  default     = "aws-services"
}

variable "environment" {
  description = "Ambiente"
  type        = string
  default     = "dev"
}

# VPC
variable "vpc_cidr" {
  description = "CIDR da VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDRs das subnets públicas"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDRs das subnets privadas"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
}

variable "availability_zones" {
  description = "Availability Zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "enable_nat_gateway" {
  description = "Habilitar NAT Gateway"
  type        = bool
  default     = true
}

# EKS
variable "eks_cluster_version" {
  description = "Versão do Kubernetes"
  type        = string
  default     = "1.28"
}

variable "eks_node_instance_type" {
  description = "Tipo de instância dos nodes"
  type        = string
  default     = "t3.medium"
}

variable "eks_node_desired_size" {
  description = "Número desejado de nodes"
  type        = number
  default     = 2
}

variable "eks_node_min_size" {
  description = "Número mínimo de nodes"
  type        = number
  default     = 1
}

variable "eks_node_max_size" {
  description = "Número máximo de nodes"
  type        = number
  default     = 4
}

# RDS
variable "rds_engine_version" {
  description = "Versão do PostgreSQL"
  type        = string
  default     = "15.4"
}

variable "rds_instance_class" {
  description = "Classe da instância RDS"
  type        = string
  default     = "db.t3.micro"
}

variable "rds_allocated_storage" {
  description = "Storage alocado (GB)"
  type        = number
  default     = 20
}

variable "rds_database_name" {
  description = "Nome do banco de dados"
  type        = string
  default     = "awsservices"
}

variable "rds_master_username" {
  description = "Username master"
  type        = string
  default     = "admin"
}

variable "rds_master_password" {
  description = "Password master"
  type        = string
  sensitive   = true
}

variable "rds_multi_az" {
  description = "Habilitar Multi-AZ"
  type        = bool
  default     = false
}

variable "rds_backup_retention_period" {
  description = "Período de retenção de backup (dias)"
  type        = number
  default     = 7
}

# Monitoring
variable "alarm_email" {
  description = "Email para alertas"
  type        = string
  default     = ""
}
