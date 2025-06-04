# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "seminar-hall-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name        = "seminar-hall-db-subnet-group"
    Environment = var.environment
  }
}

# Random password for database
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# Store database password in SSM
resource "aws_ssm_parameter" "db_password" {
  name  = "/seminar-hall/${var.environment}/db-password"
  type  = "SecureString"
  value = random_password.db_password.result

  tags = {
    Name        = "seminar-hall-db-password"
    Environment = var.environment
  }
}

# PostgreSQL RDS Instance
resource "aws_db_instance" "postgres" {
  identifier = "seminar-hall-postgres"

  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = "seminar_hall_booking"
  username = "postgres"
  password = random_password.db_password.result

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true
  deletion_protection = false

  performance_insights_enabled = true
  monitoring_interval         = 60
  monitoring_role_arn        = aws_iam_role.rds_monitoring.arn

  tags = {
    Name        = "seminar-hall-postgres"
    Environment = var.environment
  }
}

# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name       = "seminar-hall-cache-subnet"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name        = "seminar-hall-cache-subnet"
    Environment = var.environment
  }
}

# Redis ElastiCache Cluster
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "seminar-hall-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]

  tags = {
    Name        = "seminar-hall-redis"
    Environment = var.environment
  }
}

# Security Group for Redis
resource "aws_security_group" "redis" {
  name_prefix = "seminar-hall-redis-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name        = "seminar-hall-redis-sg"
    Environment = var.environment
  }
}

# EFS for Prometheus configuration
resource "aws_efs_file_system" "prometheus_config" {
  creation_token = "seminar-hall-prometheus-config"
  encrypted      = true

  tags = {
    Name        = "seminar-hall-prometheus-config"
    Environment = var.environment
  }
}

# EFS Mount Targets
resource "aws_efs_mount_target" "prometheus_config" {
  count = length(aws_subnet.private)

  file_system_id  = aws_efs_file_system.prometheus_config.id
  subnet_id       = aws_subnet.private[count.index].id
  security_groups = [aws_security_group.efs.id]
}

# Security Group for EFS
resource "aws_security_group" "efs" {
  name_prefix = "seminar-hall-efs-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name        = "seminar-hall-efs-sg"
    Environment = var.environment
  }
}

# SSM Parameters for secrets
resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/seminar-hall/${var.environment}/jwt-secret"
  type  = "SecureString"
  value = "your-jwt-secret-change-this"

  tags = {
    Name        = "seminar-hall-jwt-secret"
    Environment = var.environment
  }
}

resource "aws_ssm_parameter" "grafana_password" {
  name  = "/seminar-hall/${var.environment}/grafana-password"
  type  = "SecureString"
  value = "admin123"

  tags = {
    Name        = "seminar-hall-grafana-password"
    Environment = var.environment
  }
}
