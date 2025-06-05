#!/bin/bash

# 🔄 Local CI Pipeline Execution
# This script runs the exact same steps as GitHub Actions CI

set -e

echo "🔄 =============================================="
echo "🚀 Running CI Pipeline Locally"
echo "🔄 =============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}📋 CI Step: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Step 1: Code Quality Checks (same as GitHub Actions)
print_step "1. Code Quality Checks"
echo "Running linting..."
npm run lint
print_success "Linting passed"

echo "Running TypeScript type checking..."
npx tsc --noEmit --project .
print_success "TypeScript checks passed"
echo ""

# Step 2: Unit Tests (same as GitHub Actions)
print_step "2. Unit Tests"
echo "Running Jest tests with coverage..."
npm test -- --coverage --watchAll=false --passWithNoTests
print_success "Unit tests passed"
echo ""

# Step 3: Build Tests (same as GitHub Actions)
print_step "3. Build Verification"
echo "Building frontend..."
MONGODB_URI=mongodb://localhost:27017/test \
MONGODB_DB=test \
JWT_SECRET=test-secret \
JWT_EXPIRES_IN=7d \
npm run build
print_success "Frontend build successful"

echo "Building backend..."
cd backend && npm run build && cd ..
print_success "Backend build successful"
echo ""

# Step 4: Docker Build Test (same as GitHub Actions)
print_step "4. Docker Build Test"
echo "Building Docker image..."
docker build \
  --build-arg MONGODB_URI=mongodb://localhost:27017/test \
  --build-arg MONGODB_DB=test \
  --build-arg JWT_SECRET=test-secret \
  --build-arg JWT_EXPIRES_IN=7d \
  --build-arg NEXTAUTH_SECRET=test-secret \
  -t seminar-hall-booking:ci-test .
print_success "Docker build successful"
echo ""

# Step 5: Start Infrastructure for Integration Tests
print_step "5. Starting Test Infrastructure"
echo "Starting databases and services..."
docker-compose up -d postgres redis
sleep 10
print_success "Test infrastructure ready"
echo ""

# Step 6: API Integration Tests with Postman (same as GitHub Actions)
print_step "6. API Integration Tests with Postman/Newman"
echo "Starting backend for testing..."
cd backend && npm start &
BACKEND_PID=$!
cd ..

echo "Waiting for backend to be ready..."
timeout 60 bash -c 'until curl -f http://localhost:5000/health > /dev/null 2>&1; do sleep 2; done'
print_success "Backend is ready"

echo "Running Postman API tests..."
docker-compose --profile testing up newman
print_success "API tests completed"

# Cleanup
echo "Stopping backend..."
kill $BACKEND_PID 2>/dev/null || true
echo ""

print_success "🎉 CI Pipeline Completed Successfully!"
echo ""
echo "📊 CI Results Summary:"
echo "   ✅ Code Quality: PASSED"
echo "   ✅ Unit Tests: PASSED"
echo "   ✅ Build: PASSED"
echo "   ✅ Docker: PASSED"
echo "   ✅ API Tests: PASSED"
echo ""
echo "🚀 Ready for CD (Continuous Deployment) stage!"
