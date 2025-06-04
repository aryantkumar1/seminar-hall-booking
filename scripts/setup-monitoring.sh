#!/bin/bash

# Setup script for monitoring stack
# Usage: ./scripts/setup-monitoring.sh [platform]
# Platforms: docker, kubernetes

set -e

PLATFORM=${1:-docker}

echo "🔧 Setting up monitoring stack for $PLATFORM..."

# Validate platform
if [[ "$PLATFORM" != "docker" && "$PLATFORM" != "kubernetes" ]]; then
    echo "❌ Error: Invalid platform. Use 'docker' or 'kubernetes'"
    exit 1
fi

# Create necessary directories
echo "📁 Creating monitoring directories..."
mkdir -p monitoring/grafana/{provisioning/datasources,provisioning/dashboards,dashboards}
mkdir -p backups
mkdir -p newman-results

if [[ "$PLATFORM" == "docker" ]]; then
    echo "🐳 Setting up Docker monitoring stack..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Error: Docker is not running"
        exit 1
    fi
    
    # Start monitoring services
    echo "🚀 Starting monitoring services..."
    docker-compose -f docker-compose.prod.yml up -d prometheus grafana node-exporter cadvisor alertmanager
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    echo "🏥 Checking service health..."
    
    # Check Prometheus
    if curl -f http://localhost:9090/-/healthy > /dev/null 2>&1; then
        echo "✅ Prometheus is healthy"
    else
        echo "❌ Prometheus health check failed"
    fi
    
    # Check Grafana
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ Grafana is healthy"
    else
        echo "❌ Grafana health check failed"
    fi
    
    echo "🎉 Docker monitoring stack setup complete!"
    echo "📊 Access URLs:"
    echo "   Grafana: http://localhost:3001 (admin/admin)"
    echo "   Prometheus: http://localhost:9090"
    echo "   AlertManager: http://localhost:9093"
    echo "   Node Exporter: http://localhost:9100"
    echo "   cAdvisor: http://localhost:8080"

elif [[ "$PLATFORM" == "kubernetes" ]]; then
    echo "☸️ Setting up Kubernetes monitoring stack..."
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        echo "❌ Error: kubectl is not installed"
        exit 1
    fi
    
    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info > /dev/null 2>&1; then
        echo "❌ Error: Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Create namespace
    echo "📦 Creating namespace..."
    kubectl apply -f k8s/namespace.yaml
    
    # Create monitoring ConfigMaps
    echo "🔧 Creating monitoring configuration..."
    kubectl create configmap prometheus-config \
        --from-file=monitoring/prometheus.yml \
        --from-file=monitoring/alert.rules.yml \
        -n seminar-hall-booking --dry-run=client -o yaml | kubectl apply -f -
    
    kubectl create configmap grafana-provisioning \
        --from-file=monitoring/grafana/provisioning/ \
        -n seminar-hall-booking --dry-run=client -o yaml | kubectl apply -f -
    
    # Create secrets
    echo "🔐 Creating secrets..."
    kubectl create secret generic grafana-secrets \
        --from-literal=admin-password=admin123 \
        -n seminar-hall-booking --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy monitoring stack
    echo "📊 Deploying monitoring stack..."
    kubectl apply -f k8s/monitoring.yaml
    
    # Wait for deployments to be ready
    echo "⏳ Waiting for monitoring services to be ready..."
    kubectl wait --for=condition=available deployment/prometheus -n seminar-hall-booking --timeout=300s
    kubectl wait --for=condition=available deployment/grafana -n seminar-hall-booking --timeout=300s
    
    # Show status
    echo "📊 Monitoring stack status:"
    kubectl get pods -n seminar-hall-booking -l app=prometheus
    kubectl get pods -n seminar-hall-booking -l app=grafana
    
    echo "🎉 Kubernetes monitoring stack setup complete!"
    echo "📊 Access URLs (use kubectl port-forward):"
    echo "   Grafana: kubectl port-forward service/grafana-service 3001:3000 -n seminar-hall-booking"
    echo "   Prometheus: kubectl port-forward service/prometheus-service 9090:9090 -n seminar-hall-booking"
    echo ""
    echo "🔧 Quick access commands:"
    echo "   kubectl port-forward service/grafana-service 3001:3000 -n seminar-hall-booking &"
    echo "   kubectl port-forward service/prometheus-service 9090:9090 -n seminar-hall-booking &"
fi

echo ""
echo "📚 Next steps:"
echo "1. Configure AlertManager with your email/Slack webhooks"
echo "2. Import additional Grafana dashboards"
echo "3. Set up log aggregation (ELK stack)"
echo "4. Configure backup strategies"
echo "5. Set up SSL certificates for production"
echo ""
echo "✅ Monitoring setup completed successfully!"
