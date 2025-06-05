# 🐳 Docker Hub Setup Guide

This guide will help you set up Docker Hub integration for your Seminar Hall Booking application.

## 📋 Prerequisites

1. **Docker Hub Account**: [Sign up at hub.docker.com](https://hub.docker.com)
2. **Docker installed** on your local machine
3. **Git repository** with your code

## 🚀 Quick Setup

### Step 1: Create Docker Hub Repository

1. Go to [hub.docker.com](https://hub.docker.com)
2. Click **"Create Repository"**
3. **Repository Name**: `seminar-hall-booking`
4. **Visibility**: Public (recommended) or Private
5. **Description**: "Full-stack seminar hall booking system with Next.js and Node.js"

### Step 2: Set Up Local Environment

1. **Copy environment file**:
   ```bash
   cp .env.docker .env
   ```

2. **Update your Docker Hub username**:
   ```bash
   # Edit .env file
   DOCKER_USERNAME=your-dockerhub-username
   ```

3. **Login to Docker Hub**:
   ```bash
   docker login
   ```

### Step 3: Build and Push Images

#### Option A: Using Scripts (Recommended)

```bash
# Make scripts executable
chmod +x scripts/docker-build.sh
chmod +x scripts/docker-push.sh

# Build images
./scripts/docker-build.sh your-dockerhub-username

# Push to Docker Hub
./scripts/docker-push.sh your-dockerhub-username
```

#### Option B: Using Docker Compose

```bash
# Set your username
export DOCKER_USERNAME=your-dockerhub-username

# Build images
docker-compose build

# Push images
docker-compose push
```

#### Option C: Manual Commands

```bash
# Build Backend
docker build -t your-username/seminar-hall-booking:backend-latest ./backend

# Build Frontend  
docker build -t your-username/seminar-hall-booking:frontend-latest -f frontend.Dockerfile .

# Push to Docker Hub
docker push your-username/seminar-hall-booking:backend-latest
docker push your-username/seminar-hall-booking:frontend-latest
```

## 🔧 GitHub Actions Integration

### Step 1: Add GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:
```
DOCKER_USERNAME = your-dockerhub-username
DOCKER_PASSWORD = your-dockerhub-password-or-token
```

### Step 2: Automatic Building

The CI/CD pipeline will automatically:
- ✅ Build Docker images on every push
- ✅ Push to both GitHub Container Registry and Docker Hub
- ✅ Tag with git commit hash and "latest"
- ✅ Use build caching for faster builds

## 📦 Using Your Docker Images

### Pull and Run from Docker Hub

```bash
# Pull images
docker pull your-username/seminar-hall-booking:backend-latest
docker pull your-username/seminar-hall-booking:frontend-latest

# Run with Docker Compose
DOCKER_USERNAME=your-username docker-compose up -d
```

### Available Tags

- `backend-latest` - Latest backend build
- `frontend-latest` - Latest frontend build  
- `backend-{commit-hash}` - Specific commit builds
- `frontend-{commit-hash}` - Specific commit builds
- `backend-{timestamp}` - Timestamped builds

## 🌐 Repository URLs

After setup, your images will be available at:
- **Backend**: `https://hub.docker.com/r/your-username/seminar-hall-booking`
- **Frontend**: Same repository, different tags

## 🎯 Benefits

- ✅ **Public Distribution**: Share your application easily
- ✅ **Version Control**: Track different versions with tags
- ✅ **CI/CD Integration**: Automatic builds and pushes
- ✅ **Easy Deployment**: Pull and run anywhere
- ✅ **Backup**: Your images are safely stored in the cloud

## 🔍 Verification

Check your Docker Hub repository:
1. Go to `https://hub.docker.com/r/your-username/seminar-hall-booking`
2. Verify both backend and frontend tags are present
3. Check the "Tags" tab for all available versions

## 🚀 Next Steps

1. **Set up your Docker Hub account**
2. **Run the build scripts**
3. **Add GitHub secrets**
4. **Push code to trigger automatic builds**
5. **Share your Docker Hub repository!**
