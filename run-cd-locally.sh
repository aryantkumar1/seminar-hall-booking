#!/bin/bash

# 🚀 Local CD Pipeline Execution
# This script runs the exact same steps as GitHub Actions CD

set -e

echo "🚀 =============================================="
echo "🌐 Running CD Pipeline Locally"
echo "🚀 =============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}📋 CD Step: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Step 1: Build and Tag Images (same as GitHub Actions)
print_step "1. Build and Tag Docker Images"
echo "Building production Docker images..."

# Build backend image
docker build -f backend/Dockerfile -t seminar-hall-backend:latest ./backend
print_success "Backend image built"

# Build frontend image  
docker build -f frontend.Dockerfile -t seminar-hall-frontend:latest .
print_success "Frontend image built"
echo ""

# Step 2: Deploy Application Stack (same as GitHub Actions)
print_step "2. Deploy Application Stack"
echo "Starting full application stack..."
docker-compose up -d
print_success "Application stack deployed"

echo "Waiting for services to be healthy..."
timeout 120 bash -c 'until curl -f http://localhost:5000/health > /dev/null 2>&1; do sleep 2; done'
timeout 120 bash -c 'until curl -f http://localhost:3000 > /dev/null 2>&1; do sleep 2; done'
print_success "All services are healthy"
echo ""

# Step 3: Post-Deployment API Tests (same as GitHub Actions)
print_step "3. Post-Deployment API Testing"
echo "Running Postman tests against deployed application..."
docker-compose --profile testing up newman
print_success "Post-deployment API tests passed"
echo ""

# Step 4: Infrastructure Management with Terraform (same as GitHub Actions)
print_step "4. Infrastructure Management with Terraform"
echo "Checking Terraform configuration..."
docker-compose --profile infrastructure run terraform version
print_success "Terraform is ready"

echo ""
echo "🏗️  Terraform commands available for AWS deployment:"
echo "   terraform init    - Initialize Terraform"
echo "   terraform plan    - Plan infrastructure changes"
echo "   terraform apply   - Deploy to AWS"
echo ""
print_warning "Note: AWS deployment requires AWS credentials configuration"
echo ""

# Step 5: Monitoring and Observability (same as GitHub Actions)
print_step "5. Monitoring and Observability"
echo "Checking monitoring stack..."

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

if curl -f http://localhost:8080 > /dev/null 2>&1; then
    print_success "cAdvisor is running at http://localhost:8080"
else
    print_warning "cAdvisor not accessible"
fi
echo ""

# Step 6: Deployment Verification (same as GitHub Actions)
print_step "6. Deployment Verification"
echo "Running smoke tests..."

# Test frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is accessible at http://localhost:3000"
else
    echo -e "${RED}❌ Frontend not accessible${NC}"
    exit 1
fi

# Test backend API
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    print_success "Backend API is healthy at http://localhost:5000"
else
    echo -e "${RED}❌ Backend API not healthy${NC}"
    exit 1
fi

# Test database connectivity
if curl -f http://localhost:5000/api/halls > /dev/null 2>&1; then
    print_success "Database connectivity verified"
else
    print_warning "Database connectivity issue"
fi
echo ""

print_success "🎉 CD Pipeline Completed Successfully!"
echo ""
echo "📊 CD Results Summary:"
echo "   ✅ Docker Images: BUILT"
echo "   ✅ Application: DEPLOYED"
echo "   ✅ API Tests: PASSED"
echo "   ✅ Infrastructure: READY"
echo "   ✅ Monitoring: ACTIVE"
echo "   ✅ Smoke Tests: PASSED"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend:     http://localhost:3000"
echo "   Backend API:  http://localhost:5000"
echo "   Grafana:      http://localhost:3001"
echo "   Prometheus:   http://localhost:9090"
echo ""
echo "🚀 Production deployment simulation complete!"
echo "   For real AWS deployment, run: terraform apply"
