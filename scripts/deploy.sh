#!/bin/bash

# Deployment script for Seminar Hall Booking System
# Usage: ./scripts/deploy.sh [environment] [platform]
# Environments: staging, production
# Platforms: docker, terraform

set -e  # Exit on any error

ENVIRONMENT=${1:-staging}
PLATFORM=${2:-docker}
PROJECT_NAME="seminar-hall-booking"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

echo "🚀 Starting deployment to $ENVIRONMENT environment using $PLATFORM..."

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo "❌ Error: Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

# Validate platform
if [[ "$PLATFORM" != "docker" && "$PLATFORM" != "terraform" ]]; then
    echo "❌ Error: Invalid platform. Use 'docker' or 'terraform'"
    exit 1
fi

# Platform-specific checks
if [[ "$PLATFORM" == "docker" ]]; then
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Error: Docker is not running"
        exit 1
    fi

    # Check if docker-compose file exists
    if [[ ! -f "$DOCKER_COMPOSE_FILE" ]]; then
        echo "❌ Error: $DOCKER_COMPOSE_FILE not found"
        exit 1
    fi
elif [[ "$PLATFORM" == "terraform" ]]; then
    # Check if terraform is available
    if ! command -v terraform &> /dev/null; then
        echo "❌ Error: terraform is not installed"
        exit 1
    fi

    # Check if AWS CLI is configured
    if ! aws sts get-caller-identity > /dev/null 2>&1; then
        echo "❌ Error: AWS CLI not configured or no valid credentials"
        exit 1
    fi

    # Check if terraform directory exists
    if [[ ! -d "terraform" ]]; then
        echo "❌ Error: terraform directory not found"
        exit 1
    fi
fi

# Load environment variables
if [[ -f ".env.$ENVIRONMENT" ]]; then
    echo "📋 Loading environment variables from .env.$ENVIRONMENT"
    export $(cat .env.$ENVIRONMENT | grep -v '^#' | xargs)
else
    echo "⚠️  Warning: .env.$ENVIRONMENT file not found"
fi

# Deployment functions
deploy_docker() {
    echo "🐳 Deploying with Docker Compose..."

    # Backup current deployment (if exists)
    echo "💾 Creating backup of current deployment..."
    if docker-compose -f $DOCKER_COMPOSE_FILE ps -q > /dev/null 2>&1; then
        BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p $BACKUP_DIR
        docker-compose -f $DOCKER_COMPOSE_FILE config > $BACKUP_DIR/docker-compose.yml
        echo "✅ Backup created in $BACKUP_DIR"
    fi

    # Pull latest images
    echo "📥 Pulling latest Docker images..."
    docker-compose -f $DOCKER_COMPOSE_FILE pull

    # Stop existing containers
    echo "🛑 Stopping existing containers..."
    docker-compose -f $DOCKER_COMPOSE_FILE down

    # Start new containers
    echo "🔄 Starting new containers..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
}

deploy_terraform() {
    echo "🏗️ Deploying with Terraform..."

    cd terraform

    # Initialize Terraform
    echo "🔧 Initializing Terraform..."
    terraform init

    # Plan deployment
    echo "📋 Planning deployment..."
    terraform plan \
        -var="environment=$ENVIRONMENT" \
        -var="docker_image_tag=${GITHUB_SHA:-latest}" \
        -var="github_repository=${GITHUB_REPOSITORY:-your-username/seminar-hall-booking}"

    # Apply deployment
    echo "🚀 Applying Terraform configuration..."
    terraform apply -auto-approve \
        -var="environment=$ENVIRONMENT" \
        -var="docker_image_tag=${GITHUB_SHA:-latest}" \
        -var="github_repository=${GITHUB_REPOSITORY:-your-username/seminar-hall-booking}"

    # Get outputs
    echo "📊 Deployment completed! Getting outputs..."
    echo "🌐 Application URL: $(terraform output -raw application_url)"
    echo "📈 Grafana URL: $(terraform output -raw grafana_url)"
    echo "📊 Prometheus URL: $(terraform output -raw prometheus_url)"

    cd ..
}

# Execute deployment based on platform
if [[ "$PLATFORM" == "docker" ]]; then
    deploy_docker
elif [[ "$PLATFORM" == "terraform" ]]; then
    deploy_terraform
fi

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Health check
echo "🏥 Performing health checks..."

if [[ "$PLATFORM" == "docker" ]]; then
    HEALTH_CHECK_URL="http://localhost:5000/api/health"

    for i in {1..10}; do
        if curl -f $HEALTH_CHECK_URL > /dev/null 2>&1; then
            echo "✅ Health check passed"
            break
        else
            echo "⏳ Health check attempt $i/10 failed, retrying in 10 seconds..."
            sleep 10
        fi

        if [[ $i -eq 10 ]]; then
            echo "❌ Health check failed after 10 attempts"
            echo "🔄 Rolling back deployment..."
            docker-compose -f $DOCKER_COMPOSE_FILE down
            exit 1
        fi
    done
elif [[ "$PLATFORM" == "terraform" ]]; then
    # Get application URL from Terraform output
    cd terraform
    APP_URL=$(terraform output -raw application_url)
    cd ..

    echo "🏥 Health checking $APP_URL/api/health..."

    for i in {1..15}; do
        if curl -f "$APP_URL/api/health" > /dev/null 2>&1; then
            echo "✅ Health check passed"
            break
        else
            echo "⏳ Health check attempt $i/15 failed, retrying in 20 seconds..."
            sleep 20
        fi

        if [[ $i -eq 15 ]]; then
            echo "❌ Health check failed after 15 attempts"
            echo "🔍 Check AWS ECS console for deployment status"
            exit 1
        fi
    done
fi

# Run database migrations (if needed)
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo "🗃️  Running database migrations..."
    if [[ "$PLATFORM" == "docker" ]]; then
        docker-compose -f $DOCKER_COMPOSE_FILE exec -T app npm run db:migrate
    elif [[ "$PLATFORM" == "kubernetes" ]]; then
        kubectl exec -n seminar-hall-booking deployment/seminar-hall-app -- npm run db:migrate
    fi
fi

# Clean up
if [[ "$PLATFORM" == "docker" ]]; then
    echo "🧹 Cleaning up old Docker images..."
    docker image prune -f

    # Show deployment status
    echo "📊 Deployment Status:"
    docker-compose -f $DOCKER_COMPOSE_FILE ps
fi

echo "🎉 Deployment to $ENVIRONMENT using $PLATFORM completed successfully!"
echo "🌐 Application is available at:"

if [[ "$ENVIRONMENT" == "production" ]]; then
    if [[ "$PLATFORM" == "kubernetes" ]]; then
        echo "   Frontend: https://your-domain.com"
        echo "   API: https://api.your-domain.com"
        echo "   Grafana: https://grafana.your-domain.com"
        echo "   Prometheus: https://prometheus.your-domain.com"
    else
        echo "   Frontend: https://your-production-domain.com"
        echo "   API: https://your-production-domain.com/api"
        echo "   Grafana: https://your-production-domain.com:3001"
        echo "   Prometheus: https://your-production-domain.com:9090"
    fi
else
    echo "   Frontend: http://localhost:3000"
    echo "   API: http://localhost:5000/api"
    echo "   Grafana: http://localhost:3001"
    echo "   Prometheus: http://localhost:9090"
fi

# Optional: Run smoke tests
if command -v newman &> /dev/null; then
    echo "🧪 Running smoke tests..."
    newman run tests/postman/seminar-hall-booking.postman_collection.json \
        -e tests/postman/$ENVIRONMENT.postman_environment.json \
        --reporters cli \
        --bail || echo "⚠️  Some smoke tests failed"
fi

echo "✅ Deployment completed!"
echo ""
echo "📊 Monitoring URLs:"
echo "   Grafana Dashboard: Access comprehensive application metrics"
echo "   Prometheus Metrics: Raw metrics and alerting rules"
echo "   Application Health: /api/health endpoint for status checks"
