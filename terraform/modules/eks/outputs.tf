output "cluster_id" {
  description = "ID do cluster EKS"
  value       = aws_eks_cluster.main.id
}

output "cluster_endpoint" {
  description = "Endpoint do cluster EKS"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_security_group_id" {
  description = "Security group do cluster"
  value       = aws_security_group.cluster.id
}

output "cluster_name" {
  description = "Nome do cluster"
  value       = aws_eks_cluster.main.name
}

output "node_group_id" {
  description = "ID do node group"
  value       = aws_eks_node_group.main.id
}
