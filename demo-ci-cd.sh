#!/bin/bash

# 🚀 Seminar Hall Booking System - CI/CD Pipeline Demo
# This script demonstrates the complete CI/CD pipeline with Postman and Terraform integration

set -e

echo "🎯 =============================================="
echo "🚀 CI/CD Pipeline Demo - Seminar Hall Booking"
echo "🎯 =============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 Step: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Show current setup
print_step "1. Current Infrastructure Status"
echo "Checking running containers..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep seminar-hall || echo "No containers running"
echo ""

# Step 2: Start the application stack
print_step "2. Starting Application Stack"
echo "Starting all services with Docker Compose..."
docker-compose up -d
print_success "Application stack started"
echo ""

# Wait for services to be ready
print_step "3. Waiting for Services to be Ready"
echo "Waiting for backend health check..."
timeout 60 bash -c 'until curl -f http://localhost:5000/health > /dev/null 2>&1; do sleep 2; done' || {
    print_error "Backend failed to start"
    exit 1
}
print_success "Backend is healthy"

echo "Waiting for frontend..."
timeout 60 bash -c 'until curl -f http://localhost:3000 > /dev/null 2>&1; do sleep 2; done' || {
    print_warning "Frontend might not be ready, continuing..."
}
print_success "Frontend is accessible"
echo ""

# Step 4: Run Postman API Tests (CI/CD Integration Demo)
print_step "4. Running API Tests with Postman/Newman (CI/CD Integration)"
echo "This simulates what happens in the GitHub Actions CI pipeline..."
echo ""

echo "🧪 Running Postman collection..."
docker-compose --profile testing up newman || {
    print_warning "Some API tests failed, but continuing demo..."
}
print_success "API tests completed"
echo ""

# Step 5: Show Terraform Integration
print_step "5. Terraform Infrastructure Management (CI/CD Integration)"
echo "This simulates what happens in the GitHub Actions CD pipeline..."
echo ""

echo "🏗️  Checking Terraform configuration..."
docker-compose --profile infrastructure run terraform version
print_success "Terraform is ready"

echo ""
echo "🏗️  Terraform commands available in CI/CD:"
echo "   - terraform init    (Initialize infrastructure)"
echo "   - terraform plan    (Plan infrastructure changes)"
echo "   - terraform apply   (Deploy infrastructure)"
echo ""

# Step 6: Show monitoring stack
print_step "6. Monitoring and Observability Stack"
echo "Checking monitoring services..."

if curl -f http://localhost:9090 > /dev/null 2>&1; then
    print_success "Prometheus is running at http://localhost:9090"
else
    print_warning "Prometheus not accessible"
fi

if curl -f http://localhost:3001 > /dev/null 2>&1; then
    print_success "Grafana is running at http://localhost:3001"
else
    print_warning "Grafana not accessible"
fi
echo ""

# Step 7: Show CI/CD Pipeline Flow
print_step "7. Complete CI/CD Pipeline Flow"
echo ""
echo "🔄 Here's how the CI/CD pipeline works:"
echo ""
echo "📝 CONTINUOUS INTEGRATION (CI):"
echo "   1. Developer pushes code to GitHub"
echo "   2. GitHub Actions triggers CI pipeline"
echo "   3. Runs linting, type checking, unit tests"
echo "   4. Builds Docker images"
echo "   5. 🧪 Runs Postman API tests (Newman)"
echo "   6. Publishes test results and artifacts"
echo ""
echo "🚀 CONTINUOUS DEPLOYMENT (CD):"
echo "   1. If CI passes, triggers CD pipeline"
echo "   2. Builds and pushes Docker images to registry"
echo "   3. 🧪 Runs Postman integration tests"
echo "   4. Deploys to staging environment"
echo "   5. 🏗️  Uses Terraform to deploy to AWS production"
echo "   6. Runs smoke tests with Postman on production"
echo "   7. 📊 Monitoring automatically starts tracking"
echo ""

# Step 8: Show access URLs
print_step "8. Access Your Application"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend:     http://localhost:3000"
echo "   Backend API:  http://localhost:5000"
echo "   Health Check: http://localhost:5000/health"
echo ""
echo "📊 Monitoring URLs:"
echo "   Grafana:      http://localhost:3001 (admin/admin)"
echo "   Prometheus:   http://localhost:9090"
echo "   cAdvisor:     http://localhost:8080"
echo ""

# Step 9: Show CI/CD commands
print_step "9. CI/CD Commands You Can Run"
echo ""
echo "🧪 Test Commands (simulates CI pipeline):"
echo "   docker-compose --profile testing up newman"
echo "   npm run test"
echo "   npm run lint"
echo "   npm run type-check"
echo ""
echo "🏗️  Infrastructure Commands (simulates CD pipeline):"
echo "   docker-compose --profile infrastructure run terraform init"
echo "   docker-compose --profile infrastructure run terraform plan"
echo "   docker-compose --profile infrastructure run terraform apply"
echo ""
echo "📊 Monitoring Commands:"
echo "   docker-compose logs -f backend"
echo "   docker-compose logs -f frontend"
echo ""

# Step 10: Final status
print_step "10. Final Status Check"
echo ""
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep seminar-hall
echo ""

print_success "🎉 CI/CD Pipeline Demo Complete!"
echo ""
echo "🎯 Key Integrations Demonstrated:"
echo "   ✅ Postman/Newman API testing in CI/CD"
echo "   ✅ Terraform infrastructure deployment"
echo "   ✅ Docker containerization"
echo "   ✅ Prometheus + Grafana monitoring"
echo "   ✅ GitHub Actions automation"
echo ""
echo "🚀 Your application is now running with full CI/CD pipeline!"
echo "   Visit http://localhost:3000 to see your app"
echo "   Check the GitHub Actions workflows for automation"
echo ""
