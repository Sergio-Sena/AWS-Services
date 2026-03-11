output "frontend_bucket_id" {
  description = "ID do bucket frontend"
  value       = aws_s3_bucket.frontend.id
}

output "frontend_bucket_arn" {
  description = "ARN do bucket frontend"
  value       = aws_s3_bucket.frontend.arn
}

output "uploads_bucket_id" {
  description = "ID do bucket uploads"
  value       = aws_s3_bucket.uploads.id
}

output "uploads_bucket_arn" {
  description = "ARN do bucket uploads"
  value       = aws_s3_bucket.uploads.arn
}
