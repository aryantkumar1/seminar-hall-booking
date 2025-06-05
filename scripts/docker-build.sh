#!/bin/bash

# Docker Build and Push Script for Seminar Hall Booking
# Usage: ./scripts/docker-build.sh [your-dockerhub-username]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get Docker Hub username
DOCKER_USERNAME=${1:-${DOCKER_USERNAME}}

if [ -z "$DOCKER_USERNAME" ]; then
    echo -e "${RED}❌ Error: Docker Hub username not provided${NC}"
    echo -e "${YELLOW}Usage: ./scripts/docker-build.sh [your-dockerhub-username]${NC}"
    echo -e "${YELLOW}Or set DOCKER_USERNAME environment variable${NC}"
    exit 1
fi

echo -e "${BLUE}🐳 Building Docker images for Docker Hub...${NC}"
echo -e "${BLUE}📦 Docker Hub Username: ${DOCKER_USERNAME}${NC}"

# Get current git commit hash for tagging
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo -e "${BLUE}🏷️  Git Commit: ${GIT_COMMIT}${NC}"
echo -e "${BLUE}⏰ Timestamp: ${TIMESTAMP}${NC}"

# Build Backend
echo -e "${YELLOW}🔨 Building Backend Image...${NC}"
docker build -t ${DOCKER_USERNAME}/seminar-hall-booking:backend-latest \
             -t ${DOCKER_USERNAME}/seminar-hall-booking:backend-${GIT_COMMIT} \
             -t ${DOCKER_USERNAME}/seminar-hall-booking:backend-${TIMESTAMP} \
             ./backend

# Build Frontend
echo -e "${YELLOW}🔨 Building Frontend Image...${NC}"
docker build -t ${DOCKER_USERNAME}/seminar-hall-booking:frontend-latest \
             -t ${DOCKER_USERNAME}/seminar-hall-booking:frontend-${GIT_COMMIT} \
             -t ${DOCKER_USERNAME}/seminar-hall-booking:frontend-${TIMESTAMP} \
             -f frontend.Dockerfile .

echo -e "${GREEN}✅ Docker images built successfully!${NC}"

# List built images
echo -e "${BLUE}📋 Built Images:${NC}"
docker images | grep "${DOCKER_USERNAME}/seminar-hall-booking"

echo -e "${YELLOW}🚀 To push to Docker Hub, run:${NC}"
echo -e "${YELLOW}   ./scripts/docker-push.sh ${DOCKER_USERNAME}${NC}"
