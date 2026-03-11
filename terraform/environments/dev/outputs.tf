output "vpc_id" {
  description = "ID da VPC"
  value       = module.vpc.vpc_id
}

output "eks_cluster_endpoint" {
  description = "Endpoint do cluster EKS"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_name" {
  description = "Nome do cluster EKS"
  value       = module.eks.cluster_name
}

output "rds_endpoint" {
  description = "Endpoint do RDS"
  value       = module.rds.db_endpoint
}

output "rds_database_name" {
  description = "Nome do banco de dados"
  value       = module.rds.db_name
}

output "frontend_bucket" {
  description = "Bucket do frontend"
  value       = module.s3.frontend_bucket_id
}

output "uploads_bucket" {
  description = "Bucket de uploads"
  value       = module.s3.uploads_bucket_id
}

output "cloudfront_domain" {
  description = "Domain do CloudFront"
  value       = module.cloudfront.distribution_domain_name
}

output "cloudfront_distribution_id" {
  description = "ID da distribuição CloudFront"
  value       = module.cloudfront.distribution_id
}
