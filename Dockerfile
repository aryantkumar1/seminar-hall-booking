# Simple single-stage Docker build for CI/CD
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Accept build arguments
ARG MONGODB_URI=mongodb://localhost:27017/seminar-hall-booking
ARG MONGODB_DB=seminar-hall-booking
ARG JWT_SECRET=your-secret-key-here
ARG JWT_EXPIRES_IN=7d
ARG NEXTAUTH_SECRET=your-nextauth-secret-here

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV MONGODB_URI=$MONGODB_URI
ENV MONGODB_DB=$MONGODB_DB
ENV JWT_SECRET=$JWT_SECRET
ENV JWT_EXPIRES_IN=$JWT_EXPIRES_IN
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install
RUN cd backend && npm install

# Create public directory
RUN mkdir -p public

# Copy source code
COPY . .

# Build the application
RUN npm run build
RUN cd backend && npm run build

# Expose ports
EXPOSE 3000 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start both frontend and backend
CMD ["sh", "-c", "cd backend && npm start & npm start"]
