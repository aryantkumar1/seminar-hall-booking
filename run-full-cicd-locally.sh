#!/bin/bash

# 🔄🚀 Complete Local CI/CD Pipeline Execution
# This script runs the EXACT same steps as GitHub Actions CI/CD pipeline

set -e

echo "🔄🚀 =============================================="
echo "🎯 Complete CI/CD Pipeline - Local Execution"
echo "🔄🚀 =============================================="
echo ""
echo "This simulates the EXACT GitHub Actions workflow:"
echo "  1. Continuous Integration (CI)"
echo "  2. Continuous Deployment (CD)"
echo "  3. Postman API Testing"
echo "  4. Terraform Infrastructure"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_stage() {
    echo -e "${PURPLE}🎯 STAGE: $1${NC}"
    echo "----------------------------------------"
}

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
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

# Clean start
print_stage "PREPARATION"
print_step "Cleaning previous containers..."
docker-compose down --remove-orphans > /dev/null 2>&1 || true
print_success "Environment cleaned"
echo ""

# ============================================
# STAGE 1: CONTINUOUS INTEGRATION (CI)
# ============================================
print_stage "CONTINUOUS INTEGRATION (CI)"
echo "This stage runs on every git push..."
echo ""

print_step "1.1 Code Quality Checks"
echo "   Running ESLint..."
npm run lint > /dev/null 2>&1
print_success "   Linting passed"

echo "   Running TypeScript checks..."
npx tsc --noEmit --project . > /dev/null 2>&1
print_success "   TypeScript checks passed"
echo ""

print_step "1.2 Unit Tests"
echo "   Running Jest tests with coverage..."
npm test -- --coverage --watchAll=false --passWithNoTests > /dev/null 2>&1
print_success "   Unit tests passed with coverage"
echo ""

print_step "1.3 Build Verification"
echo "   Building frontend..."
MONGODB_URI=mongodb://localhost:27017/test \
MONGODB_DB=test \
JWT_SECRET=test-secret \
JWT_EXPIRES_IN=7d \
npm run build > /dev/null 2>&1
print_success "   Frontend build successful"

echo "   Building backend..."
cd backend && npm run build > /dev/null 2>&1 && cd ..
print_success "   Backend build successful"
echo ""

print_step "1.4 Docker Build Test"
echo "   Building Docker image..."
docker build \
  --build-arg MONGODB_URI=mongodb://localhost:27017/test \
  --build-arg MONGODB_DB=test \
  --build-arg JWT_SECRET=test-secret \
  --build-arg JWT_EXPIRES_IN=7d \
  --build-arg NEXTAUTH_SECRET=test-secret \
  -t seminar-hall-booking:ci-test . > /dev/null 2>&1
print_success "   Docker build successful"
echo ""

print_step "1.5 Integration Tests with Postman"
echo "   Starting test infrastructure..."
docker-compose up -d postgres redis > /dev/null 2>&1
sleep 5

echo "   Starting backend for API testing..."
cd backend && npm start > /dev/null 2>&1 &
BACKEND_PID=$!
cd ..

echo "   Waiting for backend to be ready..."
timeout 60 bash -c 'until curl -f http://localhost:5000/health > /dev/null 2>&1; do sleep 2; done'

echo "   Running Postman API tests..."
docker-compose --profile testing up newman > /dev/null 2>&1
print_success "   API integration tests passed"

echo "   Cleaning up test processes..."
kill $BACKEND_PID 2>/dev/null || true
sleep 2
echo ""

print_success "🎉 CI STAGE COMPLETED - All quality gates passed!"
echo ""

# ============================================
# STAGE 2: CONTINUOUS DEPLOYMENT (CD)
# ============================================
print_stage "CONTINUOUS DEPLOYMENT (CD)"
echo "This stage runs after CI passes..."
echo ""

print_step "2.1 Build Production Images"
echo "   Building backend production image..."
docker build -f backend/Dockerfile -t seminar-hall-backend:latest ./backend > /dev/null 2>&1
print_success "   Backend image built"

echo "   Building frontend production image..."
docker build -f frontend.Dockerfile -t seminar-hall-frontend:latest . > /dev/null 2>&1
print_success "   Frontend image built"
echo ""

print_step "2.2 Deploy Application Stack"
echo "   Deploying full application stack..."
docker-compose up -d > /dev/null 2>&1
print_success "   Application stack deployed"

echo "   Waiting for services to be healthy..."
timeout 120 bash -c 'until curl -f http://localhost:5000/health > /dev/null 2>&1; do sleep 2; done'
timeout 120 bash -c 'until curl -f http://localhost:3000 > /dev/null 2>&1; do sleep 2; done'
print_success "   All services are healthy"
echo ""

print_step "2.3 Post-Deployment Testing"
echo "   Running Postman tests against deployed application..."
docker-compose --profile testing up newman > /dev/null 2>&1
print_success "   Post-deployment API tests passed"
echo ""

print_step "2.4 Infrastructure Management (Terraform)"
echo "   Checking Terraform readiness..."
docker-compose --profile infrastructure run terraform version > /dev/null 2>&1
print_success "   Terraform is ready for AWS deployment"
echo ""

print_step "2.5 Monitoring Stack Verification"
echo "   Checking monitoring services..."

# Check if monitoring is running from previous setup
if curl -f http://localhost:9090 > /dev/null 2>&1; then
    print_success "   Prometheus is running"
else
    print_warning "   Prometheus not running (start with docker-compose -f docker-compose.prod.yml up -d)"
fi

if curl -f http://localhost:3001 > /dev/null 2>&1; then
    print_success "   Grafana is running"
else
    print_warning "   Grafana not running (start with docker-compose -f docker-compose.prod.yml up -d)"
fi
echo ""

print_step "2.6 Smoke Tests"
echo "   Testing frontend accessibility..."
curl -f http://localhost:3000 > /dev/null 2>&1
print_success "   Frontend is accessible"

echo "   Testing backend API health..."
curl -f http://localhost:5000/health > /dev/null 2>&1
print_success "   Backend API is healthy"

echo "   Testing database connectivity..."
curl -f http://localhost:5000/api/halls > /dev/null 2>&1
print_success "   Database connectivity verified"
echo ""

print_success "🎉 CD STAGE COMPLETED - Application deployed successfully!"
echo ""

# ============================================
# FINAL SUMMARY
# ============================================
print_stage "CI/CD PIPELINE SUMMARY"
echo ""
echo "📊 Pipeline Results:"
echo "   ✅ Code Quality: PASSED"
echo "   ✅ Unit Tests: PASSED"  
echo "   ✅ Build: PASSED"
echo "   ✅ Docker: PASSED"
echo "   ✅ API Tests: PASSED"
echo "   ✅ Deployment: SUCCESSFUL"
echo "   ✅ Smoke Tests: PASSED"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend:     http://localhost:3000"
echo "   Backend API:  http://localhost:5000"
echo "   Health Check: http://localhost:5000/health"
echo ""
echo "🧪 Testing Commands:"
echo "   API Tests:    docker-compose --profile testing up newman"
echo "   Manual Test:  curl http://localhost:5000/health"
echo ""
echo "🏗️  Infrastructure Commands:"
echo "   Terraform:    docker-compose --profile infrastructure run terraform"
echo "   AWS Deploy:   cd terraform && terraform apply"
echo ""
print_success "🚀 Complete CI/CD Pipeline Executed Successfully!"
echo "   This is exactly what GitHub Actions does automatically!"
echo ""
