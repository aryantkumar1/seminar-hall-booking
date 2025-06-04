# 🚀 Quick Start Guide

Get your **Seminar Hall Booking System** up and running with **CI/CD pipeline** in minutes!

## ⚡ **Super Quick Start** (5 minutes)

### **1. Prerequisites**
- ✅ **Docker Desktop** installed and running
- ✅ **Node.js 18+** installed
- ✅ **Git** repository ready

### **2. One-Command Setup**
```bash
npm run setup
```

This script will:
- ✅ Check all prerequisites
- ✅ Install dependencies
- ✅ Create configuration files
- ✅ Test Docker build
- ✅ Set up monitoring directories

### **3. Start Development**
```bash
# Start local development with monitoring
npm run docker:run

# Access your application
# Frontend: http://localhost:3000
# API: http://localhost:5000
# Grafana: http://localhost:3001
# Prometheus: http://localhost:9090
```

## 🎯 **What You Get**

### **Complete CI/CD Pipeline**
- ✅ **GitHub Actions** - Automated testing and deployment
- ✅ **Docker** - Containerized application
- ✅ **Prometheus** - Metrics collection
- ✅ **Grafana** - Beautiful dashboards
- ✅ **Postman/Newman** - API testing
- ✅ **Terraform** - Infrastructure as Code (AWS)

### **Monitoring Stack**
- 📊 **Application Metrics** - Request rates, response times, errors
- 🖥️ **System Metrics** - CPU, memory, disk usage
- 🏢 **Business Metrics** - Booking rates, hall utilization
- 🚨 **Smart Alerts** - Email and Slack notifications

## 🚀 **Deployment Options**

### **Option 1: Local Development**
```bash
npm run docker:run        # Start all services
npm run docker:logs       # View logs
npm run docker:stop       # Stop all services
```

### **Option 2: Docker Production**
```bash
npm run deploy:docker     # Deploy to production server
```

### **Option 3: AWS with Terraform**
```bash
npm run deploy:terraform  # Deploy to AWS ECS
```

## 🔧 **Configuration**

### **Environment Variables**
1. Copy `.env.production.template` to `.env.production`
2. Update with your actual values:
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=your-secure-secret
```

### **GitHub Secrets**
Add these secrets to your GitHub repository:
```bash
# For Docker deployment
PRODUCTION_HOST=your-server-ip
PRODUCTION_USER=your-ssh-username
PRODUCTION_SSH_KEY=your-ssh-private-key

# For AWS deployment
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-west-2
```

## 🧪 **Testing**

### **Run Tests**
```bash
npm test                  # Unit tests
npm run test:coverage     # Coverage report
npm run postman:test      # API tests
npm run postman:test:html # API tests with HTML report
```

### **CI/CD Pipeline**
Every push triggers:
- ✅ **Linting** (ESLint, TypeScript)
- ✅ **Unit Tests** (Jest)
- ✅ **Docker Build** (Multi-stage)
- ✅ **API Tests** (Postman/Newman)
- ✅ **Deployment** (Staging → Production)

## 📊 **Monitoring**

### **Access Dashboards**
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Application**: http://localhost:3000

### **Key Metrics**
- 🌐 **HTTP Requests** - Rate, duration, status codes
- 🏢 **Bookings** - Success rate, volume, trends
- 🖥️ **System** - CPU, memory, disk usage
- 🐳 **Containers** - Resource usage, health

## 🛠️ **Useful Commands**

### **Development**
```bash
npm run dev               # Start Next.js dev server
npm run build             # Build for production
npm run type-check        # TypeScript checking
npm run lint              # ESLint checking
```

### **Docker**
```bash
npm run docker:build      # Build Docker image
npm run docker:run        # Start all services
npm run docker:prod       # Start production stack
npm run docker:logs       # View container logs
npm run docker:stop       # Stop all services
```

### **Monitoring**
```bash
npm run monitoring:setup  # Setup monitoring stack
```

## 🆘 **Troubleshooting**

### **Common Issues**

#### **Docker not starting**
```bash
# Check Docker is running
docker --version
docker ps

# Restart Docker Desktop
```

#### **Port conflicts**
```bash
# Check what's using ports
lsof -i :3000
lsof -i :5000

# Stop conflicting services
```

#### **Build failures**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild from scratch
npm run docker:build
```

### **Logs & Debugging**
```bash
# View application logs
npm run docker:logs

# Check specific container
docker logs seminar-hall-app

# Enter container for debugging
docker exec -it seminar-hall-app sh
```

## 📚 **Documentation**

- 📖 **Complete CI/CD Guide**: [CI-CD-README.md](./CI-CD-README.md)
- 🏗️ **Terraform Configuration**: [terraform/](./terraform/)
- 🧪 **API Tests**: [tests/postman/](./tests/postman/)
- 📊 **Monitoring Config**: [monitoring/](./monitoring/)

## 🎉 **Next Steps**

1. ✅ **Customize** the application for your needs
2. ✅ **Configure** production environment variables
3. ✅ **Set up** GitHub secrets for deployment
4. ✅ **Deploy** to your preferred platform
5. ✅ **Monitor** your application with Grafana

## 🚀 **You're Ready!**

Your **enterprise-grade CI/CD pipeline** is now ready! Every code change will be automatically tested, built, and deployed with comprehensive monitoring.

**Happy coding!** 🎯
