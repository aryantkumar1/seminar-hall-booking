#!/bin/bash

# Docker Push Script for Seminar Hall Booking
# Usage: ./scripts/docker-push.sh [your-dockerhub-username]

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
    echo -e "${YELLOW}Usage: ./scripts/docker-push.sh [your-dockerhub-username]${NC}"
    echo -e "${YELLOW}Or set DOCKER_USERNAME environment variable${NC}"
    exit 1
fi

echo -e "${BLUE}🐳 Pushing Docker images to Docker Hub...${NC}"
echo -e "${BLUE}📦 Docker Hub Username: ${DOCKER_USERNAME}${NC}"

# Check if user is logged in to Docker Hub
if ! docker info | grep -q "Username: ${DOCKER_USERNAME}"; then
    echo -e "${YELLOW}🔐 Please login to Docker Hub first:${NC}"
    echo -e "${YELLOW}   docker login${NC}"
    docker login
fi

# Get current git commit hash for tagging
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo -e "${BLUE}🏷️  Git Commit: ${GIT_COMMIT}${NC}"
echo -e "${BLUE}⏰ Timestamp: ${TIMESTAMP}${NC}"

# Push Backend Images
echo -e "${YELLOW}📤 Pushing Backend Images...${NC}"
docker push ${DOCKER_USERNAME}/seminar-hall-booking:backend-latest
docker push ${DOCKER_USERNAME}/seminar-hall-booking:backend-${GIT_COMMIT}
docker push ${DOCKER_USERNAME}/seminar-hall-booking:backend-${TIMESTAMP}

# Push Frontend Images
echo -e "${YELLOW}📤 Pushing Frontend Images...${NC}"
docker push ${DOCKER_USERNAME}/seminar-hall-booking:frontend-latest
docker push ${DOCKER_USERNAME}/seminar-hall-booking:frontend-${GIT_COMMIT}
docker push ${DOCKER_USERNAME}/seminar-hall-booking:frontend-${TIMESTAMP}

echo -e "${GREEN}✅ All images pushed to Docker Hub successfully!${NC}"

# Show Docker Hub repository URL
echo -e "${BLUE}🌐 View your repository at:${NC}"
echo -e "${BLUE}   https://hub.docker.com/r/${DOCKER_USERNAME}/seminar-hall-booking${NC}"

echo -e "${GREEN}🎉 Your images are now available on Docker Hub!${NC}"
