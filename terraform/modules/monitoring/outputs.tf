output "eks_log_group_name" {
  description = "Nome do log group do EKS"
  value       = aws_cloudwatch_log_group.eks.name
}

output "app_log_group_name" {
  description = "Nome do log group da aplicação"
  value       = aws_cloudwatch_log_group.application.name
}

output "sns_topic_arn" {
  description = "ARN do tópico SNS"
  value       = var.alarm_email != "" ? aws_sns_topic.alarms[0].arn : ""
}
