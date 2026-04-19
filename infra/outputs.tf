output "api_public_ip" {
  description = "Skopiuj ten adres do przeglądarki (z portem 8000)"
  value       = aws_instance.fastapi_server.public_ip
}

output "db_endpoint" {
  description = "Adres wewnętrzny RDS (skopiuj go do konfiguracji na EC2)"
  value       = aws_db_instance.postgres.endpoint
}

output "redis_endpoint" {
  description = "Adres wewnętrzny Redis (ElastiCache)"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}