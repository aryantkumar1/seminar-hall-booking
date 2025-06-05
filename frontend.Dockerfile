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

# Build the Next.js application
RUN npm run build

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create public directory
RUN mkdir -p ./public

# Switch to non-root user (much faster than chown)
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start the application
CMD ["npm", "start"]
