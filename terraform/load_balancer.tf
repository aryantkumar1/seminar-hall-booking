# Application Load Balancer
resource "aws_lb" "main" {
  name               = "seminar-hall-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false

  tags = {
    Name        = "seminar-hall-alb"
    Environment = var.environment
  }
}

# Target Groups
resource "aws_lb_target_group" "app" {
  name     = "seminar-hall-app-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = {
    Name        = "seminar-hall-app-tg"
    Environment = var.environment
  }
}

resource "aws_lb_target_group" "api" {
  name     = "seminar-hall-api-tg"
  port     = 5000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/api/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = {
    Name        = "seminar-hall-api-tg"
    Environment = var.environment
  }
}

resource "aws_lb_target_group" "grafana" {
  name     = "seminar-hall-grafana-tg"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/api/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = {
    Name        = "seminar-hall-grafana-tg"
    Environment = var.environment
  }
}

resource "aws_lb_target_group" "prometheus" {
  name     = "seminar-hall-prometheus-tg"
  port     = 9090
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/-/healthy"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = {
    Name        = "seminar-hall-prometheus-tg"
    Environment = var.environment
  }
}

# ALB Listeners
resource "aws_lb_listener" "app" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# Listener Rules for different paths
resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.app.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

resource "aws_lb_listener_rule" "grafana" {
  listener_arn = aws_lb_listener.app.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.grafana.arn
  }

  condition {
    host_header {
      values = ["grafana.${var.domain_name}"]
    }
  }
}

resource "aws_lb_listener_rule" "prometheus" {
  listener_arn = aws_lb_listener.app.arn
  priority     = 300

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.prometheus.arn
  }

  condition {
    host_header {
      values = ["prometheus.${var.domain_name}"]
    }
  }
}

# Route 53 (optional - for custom domain)
data "aws_route53_zone" "main" {
  count = var.domain_name != "your-domain.com" ? 1 : 0
  name  = var.domain_name
}

resource "aws_route53_record" "app" {
  count   = var.domain_name != "your-domain.com" ? 1 : 0
  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "grafana" {
  count   = var.domain_name != "your-domain.com" ? 1 : 0
  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = "grafana.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "prometheus" {
  count   = var.domain_name != "your-domain.com" ? 1 : 0
  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = "prometheus.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}
