# Multi-stage Docker build for Next.js application

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies (dev deps needed for build)
RUN npm ci && npm cache clean --force
RUN cd backend && npm ci --only=production && npm cache clean --force

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules

# Create public directory first
RUN mkdir -p public

# Copy source code
COPY . .

# Accept build arguments
ARG MONGODB_URI=mongodb://localhost:27017/seminar-hall-booking
ARG MONGODB_DB=seminar-hall-booking
ARG JWT_SECRET=your-secret-key-here
ARG JWT_EXPIRES_IN=7d
ARG NEXTAUTH_SECRET=your-nextauth-secret-here

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV MONGODB_URI=$MONGODB_URI
ENV MONGODB_DB=$MONGODB_DB
ENV JWT_SECRET=$JWT_SECRET
ENV JWT_EXPIRES_IN=$JWT_EXPIRES_IN
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application (handle optional directories)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/backend ./backend

# Create public directory
RUN mkdir -p ./public

# Copy backend dependencies
COPY --from=deps /app/backend/node_modules ./backend/node_modules

# Switch to non-root user (much faster than chown)
USER nextjs

# Expose ports
EXPOSE 3000 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start both frontend and backend
CMD ["sh", "-c", "cd backend && npm start & npm start"]
