variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente"
  type        = string
}

variable "frontend_bucket_id" {
  description = "ID do bucket frontend"
  type        = string
}

variable "frontend_bucket_arn" {
  description = "ARN do bucket frontend"
  type        = string
}
