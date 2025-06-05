FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code (excluding backend and API routes)
COPY . .
RUN rm -rf backend
RUN rm -rf src/app/api

# Set environment variables for build (dummy values)
ENV MONGODB_URI=mongodb://dummy:27017/dummy
ENV MONGODB_DB=dummy
ENV JWT_SECRET=dummy-secret
ENV JWT_EXPIRES_IN=7d
ENV NEXTAUTH_SECRET=dummy-secret

# Create public directory
RUN mkdir -p ./public

# Expose port 9002 for development
EXPOSE 9002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:9002 || exit 1

# Start the development server on port 9002
CMD ["npm", "run", "dev"]
