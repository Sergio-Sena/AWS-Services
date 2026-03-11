variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente"
  type        = string
}

variable "cluster_name" {
  description = "Nome do cluster EKS"
  type        = string
}

variable "db_instance_id" {
  description = "ID da instância RDS"
  type        = string
}

variable "alarm_email" {
  description = "Email para alertas"
  type        = string
  default     = ""
}
