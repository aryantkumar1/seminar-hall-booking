# Ultra-simple Docker build for CI/CD
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy backend package files only
COPY backend/package*.json ./backend/

# Install backend dependencies only
RUN cd backend && npm install

# Copy backend source code only
COPY backend/ ./backend/

# Build backend
RUN cd backend && npm run build

# Expose backend port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start backend
CMD ["sh", "-c", "cd backend && npm start"]
