FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev deps for TypeScript compilation)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Install tsc-alias to resolve path aliases
RUN npm install -g tsc-alias

# Resolve TypeScript path aliases in compiled JS
RUN tsc-alias -p tsconfig.json

# Remove dev dependencies after build (keep production lean)
RUN npm ci --only=production && npm cache clean --force

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["npm", "start"]
