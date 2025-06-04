# CI/CD Pipeline for Seminar Hall Booking System

This document explains the comprehensive CI/CD pipeline implemented using GitHub Actions, Docker, and Postman for the Seminar Hall Booking System.

## Overview

The CI/CD pipeline automates the entire software delivery process from code commit to production deployment, ensuring code quality, security, and reliability.

## Pipeline Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Code      │    │     CI      │    │   Testing   │    │     CD      │
│   Commit    │───▶│  Pipeline   │───▶│  & Quality  │───▶│  Pipeline   │
│             │    │             │    │   Checks    │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                           │                   │                   │
                           ▼                   ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │   Lint &    │    │   API       │    │   Deploy    │
                   │ Type Check  │    │  Testing    │    │ to Staging  │
                   └─────────────┘    └─────────────┘    └─────────────┘
                           │                   │                   │
                           ▼                   ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │   Unit      │    │   Docker    │    │   Deploy    │
                   │   Tests     │    │   Build     │    │ to Production│
                   └─────────────┘    └─────────────┘    └─────────────┘
```

## CI Pipeline (Continuous Integration)

### 1. **Code Quality Checks**
- **ESLint**: Checks code style and potential errors
- **TypeScript**: Type checking for both frontend and backend
- **Prettier**: Code formatting validation

### 2. **Testing Stages**
- **Unit Tests**: Jest tests for individual components and functions
- **Integration Tests**: Database and API integration tests
- **Build Tests**: Ensures application builds successfully

### 3. **Triggers**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

## CD Pipeline (Continuous Deployment)

### 1. **Docker Image Building**
- Multi-stage Docker builds for optimization
- Images pushed to GitHub Container Registry
- Automatic tagging with branch names and commit SHAs

### 2. **API Testing with Postman/Newman**
- Comprehensive API endpoint testing
- Authentication flow testing
- CRUD operations validation
- HTML reports generation

### 3. **Deployment Stages**
- **Staging**: Automatic deployment for testing
- **Production**: Manual approval required

## Docker Configuration

### Multi-Stage Build Process

1. **Dependencies Stage**: Installs production dependencies
2. **Builder Stage**: Builds the application
3. **Runner Stage**: Creates optimized production image

### Services Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Nginx     │    │  Frontend   │    │  Backend    │
│ (Reverse    │───▶│  (Next.js)  │───▶│ (Express)   │
│  Proxy)     │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    SSL      │    │   Static    │    │ PostgreSQL  │
│ Termination │    │   Assets    │    │  Database   │
└─────────────┘    └─────────────┘    └─────────────┘
                                             │
                                             ▼
                                    ┌─────────────┐
                                    │    Redis    │
                                    │   (Cache)   │
                                    └─────────────┘
```

## Postman API Testing

### Test Collection Structure

1. **Health Checks**: Verify service availability
2. **Authentication**: Login flows for admin and faculty
3. **CRUD Operations**: 
   - Create bookings
   - Read hall information
   - Update booking status
   - Delete bookings
4. **Authorization**: Role-based access control testing

### Test Environments

- **Test Environment**: Local development testing
- **Staging Environment**: Pre-production testing
- **Production Environment**: Production smoke tests

## Security Features

### 1. **Container Security**
- Non-root user execution
- Minimal base images (Alpine Linux)
- Multi-stage builds to reduce attack surface

### 2. **Network Security**
- Nginx reverse proxy with rate limiting
- SSL/TLS termination
- Security headers (HSTS, XSS protection, etc.)

### 3. **Secrets Management**
- GitHub Secrets for sensitive data
- Environment-specific configurations
- JWT secret rotation capability

## Monitoring and Health Checks

### Application Health
- HTTP health check endpoints
- Database connectivity checks
- Redis connectivity verification

### Docker Health Checks
- Container-level health monitoring
- Automatic restart on failure
- Service dependency management

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+
- GitHub account with Actions enabled

### Local Development
```bash
# Start development environment
npm run docker:run

# Run tests locally
npm run test
npm run postman:test

# Stop environment
npm run docker:stop
```

### Production Deployment
```bash
# Deploy to production
npm run docker:prod
```

## Environment Variables

### Required Secrets (GitHub)
- `STAGING_HOST`: Staging server hostname
- `STAGING_USER`: SSH username for staging
- `STAGING_SSH_KEY`: SSH private key for staging
- `PRODUCTION_HOST`: Production server hostname
- `PRODUCTION_USER`: SSH username for production
- `PRODUCTION_SSH_KEY`: SSH private key for production
- `POSTGRES_PASSWORD`: Database password
- `JWT_SECRET`: JWT signing secret

### Application Environment
- `NODE_ENV`: Environment (development/staging/production)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `NEXT_PUBLIC_API_URL`: Frontend API endpoint

## Workflow Files

### `.github/workflows/ci.yml`
- Runs on every push and PR
- Executes linting, testing, and build verification
- Parallel job execution for faster feedback

### `.github/workflows/cd.yml`
- Triggered after successful CI on main branch
- Builds and pushes Docker images
- Runs API tests with Postman
- Deploys to staging and production

## Benefits

1. **Automated Quality Assurance**: Every code change is automatically tested
2. **Fast Feedback**: Developers get immediate feedback on code quality
3. **Consistent Deployments**: Standardized deployment process
4. **Rollback Capability**: Easy rollback using Docker image tags
5. **Security**: Automated security scanning and secure deployment practices
6. **Monitoring**: Comprehensive health checks and monitoring
7. **Documentation**: API tests serve as living documentation

## Troubleshooting

### Common Issues
1. **Build Failures**: Check Docker build logs and dependency versions
2. **Test Failures**: Review test reports and database connectivity
3. **Deployment Issues**: Verify server connectivity and environment variables

### Debugging Commands
```bash
# View container logs
docker-compose logs -f [service-name]

# Check container health
docker ps
docker inspect [container-id]

# Run tests manually
npm run postman:test:html
```

## 📊 **Comprehensive Monitoring Stack**

### **Prometheus + Grafana + AlertManager**

The monitoring stack provides complete observability for your application:

#### **Prometheus Metrics Collection**
- **Application Metrics**: Request rates, response times, error rates
- **System Metrics**: CPU, memory, disk usage via Node Exporter
- **Container Metrics**: Docker container performance via cAdvisor
- **Database Metrics**: PostgreSQL and Redis performance
- **Business Metrics**: Booking rates, hall utilization, user activity

#### **Grafana Dashboards**
- **Application Overview**: Real-time application health and performance
- **Infrastructure Monitoring**: System resource utilization
- **Business Intelligence**: Booking trends and hall usage analytics
- **Alert Status**: Current alerts and their resolution status

#### **AlertManager Notifications**
- **Critical Alerts**: Email + Slack for system failures
- **Warning Alerts**: Slack notifications for performance issues
- **Info Alerts**: Slack notifications for business events

### **Monitoring Architecture**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Application │───▶│ Prometheus  │───▶│   Grafana   │
│  Metrics    │    │  (Scraping) │    │ (Dashboard) │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Node        │    │ Alert       │    │   Email/    │
│ Exporter    │    │ Manager     │    │   Slack     │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🚀 **Deployment Options**

### **1. Docker Compose Deployment**
Perfect for single-server deployments and development:

```bash
# Development
npm run docker:run

# Production
npm run docker:prod
./scripts/deploy.sh production docker
```

**Features:**
- ✅ Single-server deployment
- ✅ Easy setup and maintenance
- ✅ Built-in monitoring stack
- ✅ SSL termination with Nginx
- ✅ Automatic health checks

### **2. Kubernetes Deployment**
Enterprise-grade deployment with auto-scaling:

```bash
# Deploy to Kubernetes
./scripts/deploy.sh production kubernetes
```

**Features:**
- ✅ Horizontal Pod Autoscaling (HPA)
- ✅ Rolling updates with zero downtime
- ✅ Service mesh ready
- ✅ Multi-zone deployment
- ✅ Advanced monitoring with Prometheus Operator

### **Kubernetes Architecture**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Ingress   │───▶│   Service   │───▶│    Pods     │
│ (Load Bal.) │    │ (Discovery) │    │ (App Inst.) │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│     SSL     │    │ ConfigMaps  │    │ Persistent  │
│ Termination │    │ & Secrets   │    │  Volumes    │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🔧 **Advanced Features**

### **Auto-Scaling**
- **Horizontal Pod Autoscaler**: Scales based on CPU/Memory usage
- **Vertical Pod Autoscaler**: Adjusts resource requests automatically
- **Cluster Autoscaler**: Adds/removes nodes based on demand

### **High Availability**
- **Multi-replica deployments**: No single point of failure
- **Database clustering**: PostgreSQL with read replicas
- **Redis clustering**: High-availability caching
- **Load balancing**: Traffic distribution across instances

### **Security**
- **Network policies**: Micro-segmentation between services
- **Pod security policies**: Container security enforcement
- **RBAC**: Role-based access control
- **Secret management**: Encrypted secret storage

### **Monitoring & Observability**
- **Distributed tracing**: Request flow across services
- **Log aggregation**: Centralized logging with ELK stack
- **Metrics collection**: Comprehensive application metrics
- **Alerting**: Proactive issue detection

## 📈 **Performance Optimization**

### **Caching Strategy**
- **Redis**: Session and API response caching
- **CDN**: Static asset delivery
- **Database**: Query result caching
- **Application**: In-memory caching

### **Database Optimization**
- **Connection pooling**: Efficient database connections
- **Read replicas**: Distribute read queries
- **Indexing**: Optimized query performance
- **Partitioning**: Large table management

### **Resource Management**
- **Resource limits**: Prevent resource exhaustion
- **Quality of Service**: Guaranteed vs burstable resources
- **Node affinity**: Optimal pod placement
- **Taints and tolerations**: Workload isolation

## 🛡️ **Security Best Practices**

### **Container Security**
- **Non-root users**: All containers run as non-root
- **Minimal images**: Alpine Linux base images
- **Security scanning**: Automated vulnerability scanning
- **Image signing**: Verify image integrity

### **Network Security**
- **TLS everywhere**: End-to-end encryption
- **Network policies**: Restrict inter-pod communication
- **Ingress security**: WAF and DDoS protection
- **Service mesh**: mTLS between services

### **Data Security**
- **Encryption at rest**: Database and volume encryption
- **Backup encryption**: Encrypted backup storage
- **Secret rotation**: Automated secret rotation
- **Audit logging**: Complete audit trail

## 📊 **Monitoring Dashboards**

### **Application Dashboard**
- Request rate and response time trends
- Error rate and success rate metrics
- Database connection pool status
- Cache hit/miss ratios

### **Infrastructure Dashboard**
- CPU, memory, and disk utilization
- Network traffic and latency
- Container resource usage
- Node health and capacity

### **Business Dashboard**
- Booking request volume and trends
- Hall utilization rates
- User activity patterns
- Revenue and usage analytics

## 🚨 **Alerting Rules**

### **Critical Alerts**
- Application down (immediate notification)
- Database connectivity issues
- High error rates (>5%)
- Disk space critical (<10%)

### **Warning Alerts**
- High response times (>2s)
- High CPU usage (>80%)
- High memory usage (>85%)
- Database connection pool exhaustion

### **Business Alerts**
- Unusual booking patterns
- Low booking volume
- High booking failure rates
- System capacity approaching limits

This CI/CD pipeline ensures reliable, secure, and automated delivery of the Seminar Hall Booking System with enterprise-grade monitoring and deployment capabilities.
