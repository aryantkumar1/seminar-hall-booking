# Outputs
output "application_url" {
  description = "URL of the application"
  value       = var.domain_name != "your-domain.com" ? "https://${var.domain_name}" : "http://${aws_lb.main.dns_name}"
}

output "api_url" {
  description = "URL of the API"
  value       = var.domain_name != "your-domain.com" ? "https://${var.domain_name}/api" : "http://${aws_lb.main.dns_name}/api"
}

output "grafana_url" {
  description = "URL of Grafana dashboard"
  value       = var.domain_name != "your-domain.com" ? "https://grafana.${var.domain_name}" : "http://${aws_lb.main.dns_name}:3001"
}

output "prometheus_url" {
  description = "URL of Prometheus"
  value       = var.domain_name != "your-domain.com" ? "https://prometheus.${var.domain_name}" : "http://${aws_lb.main.dns_name}:9090"
}

output "load_balancer_dns" {
  description = "DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}

output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.postgres.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
  sensitive   = true
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.app.name
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}
