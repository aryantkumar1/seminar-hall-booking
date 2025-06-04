#!/bin/bash

# Quick Start Script for Seminar Hall Booking System CI/CD
# This script helps you get started quickly with the CI/CD pipeline

set -e

echo "🚀 Seminar Hall Booking System - Quick Start Setup"
echo "=================================================="

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    echo "   Download from: https://www.docker.com/products/docker-desktop/"
    exit 1
else
    echo "✅ Docker is installed"
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
else
    echo "✅ Docker Compose is installed"
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
else
    echo "✅ Node.js is installed ($(node --version))"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
else
    echo "✅ npm is installed ($(npm --version))"
fi

echo ""
echo "🛠️ Setting up the project..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install backend dependencies
if [ -d "backend" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p monitoring/grafana/{provisioning/datasources,provisioning/dashboards,dashboards}
mkdir -p newman-results
mkdir -p backups
mkdir -p ssl

# Create environment files
echo "🔧 Creating environment files..."

# Development environment
if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
# Development Environment Variables
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/seminar_hall_booking
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-development-jwt-secret-change-this
NEXT_PUBLIC_API_URL=http://localhost:5000
EOF
    echo "✅ Created .env.local"
fi

# Production environment template
if [ ! -f ".env.production.template" ]; then
    cat > .env.production.template << EOF
# Production Environment Variables (Template)
NODE_ENV=production
DATABASE_URL=postgresql://username:password@your-db-host:5432/seminar_hall_booking
REDIS_URL=redis://your-redis-host:6379
JWT_SECRET=your-super-secure-jwt-secret
NEXT_PUBLIC_API_URL=https://your-domain.com
GRAFANA_USER=admin
GRAFANA_PASSWORD=your-secure-password
EOF
    echo "✅ Created .env.production.template"
fi

# GitHub Actions secrets template
if [ ! -f ".github-secrets.template" ]; then
    cat > .github-secrets.template << EOF
# GitHub Secrets to Configure
# Go to: Repository Settings > Secrets and Variables > Actions

# For Docker Deployment
PRODUCTION_HOST=your-server-ip
PRODUCTION_USER=your-ssh-username
PRODUCTION_SSH_KEY=your-ssh-private-key

# For Terraform Deployment (AWS)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-west-2

# Application Secrets
JWT_SECRET=your-jwt-secret
POSTGRES_PASSWORD=your-db-password
GRAFANA_PASSWORD=your-grafana-password
EOF
    echo "✅ Created .github-secrets.template"
fi

echo ""
echo "🐳 Testing Docker setup..."

# Test Docker build
echo "🔨 Testing Docker build..."
if docker build -t seminar-hall-booking:test . > /dev/null 2>&1; then
    echo "✅ Docker build successful"
    docker rmi seminar-hall-booking:test > /dev/null 2>&1
else
    echo "❌ Docker build failed"
    exit 1
fi

echo ""
echo "🎉 Quick Start Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. 🔧 Configure your environment:"
echo "   - Copy .env.production.template to .env.production"
echo "   - Update the values with your actual configuration"
echo ""
echo "2. 🔐 Set up GitHub Secrets:"
echo "   - Go to your GitHub repository"
echo "   - Navigate to Settings > Secrets and Variables > Actions"
echo "   - Add the secrets listed in .github-secrets.template"
echo ""
echo "3. 🚀 Choose your deployment method:"
echo ""
echo "   📦 Local Development:"
echo "   npm run docker:run"
echo ""
echo "   🐳 Docker Deployment:"
echo "   ./scripts/deploy.sh production docker"
echo ""
echo "   🏗️ Terraform Deployment (AWS):"
echo "   ./scripts/deploy.sh production terraform"
echo ""
echo "4. 📊 Access your application:"
echo "   - Application: http://localhost:3000"
echo "   - API: http://localhost:5000"
echo "   - Grafana: http://localhost:3001"
echo "   - Prometheus: http://localhost:9090"
echo ""
echo "5. 🧪 Run tests:"
echo "   npm test"
echo "   npm run postman:test"
echo ""
echo "📚 Documentation:"
echo "   - CI/CD Guide: ./CI-CD-README.md"
echo "   - Deployment Scripts: ./scripts/"
echo "   - Terraform Config: ./terraform/"
echo ""
echo "🆘 Need help?"
echo "   - Check the logs: docker-compose logs -f"
echo "   - View containers: docker ps"
echo "   - Restart services: docker-compose restart"
echo ""
echo "✅ You're all set! Happy coding! 🚀"
