# Multi-stage Dockerfile with Persistent Disk Volume for Next.js Test Arena & SQLite
# Node.js 24 LTS (Krypton) + Express + Persistent Volume Mount + Directus Bridge

# ==========================================
# Stage 1: Build Stage
# ==========================================
FROM node:24-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all build dependencies
RUN npm install --no-audit

# Copy source code and configuration files
COPY . .

# Build both Vite frontend and Express server.cjs bundle
RUN npm run build

# ==========================================
# Stage 2: Production Runtime Stage
# ==========================================
FROM node:24-alpine AS runner

LABEL maintainer="Next.js Test Arena Team"
LABEL description="Production Full-Stack Container with Persistent SQLite Disk Storage"

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data

# Install curl/wget for container healthchecks
RUN apk add --no-cache curl wget

# Create persistent data directory with proper read/write permissions
RUN mkdir -p /data && chown -R node:node /data

# Declare mountable persistent volume for SQLite database & logs
VOLUME ["/data"]

# Copy package manifests & install only production runtime dependencies
COPY package*.json ./
RUN npm install --omit=dev --no-audit

# Copy compiled assets and server bundle from builder stage
COPY --from=builder /app/dist ./dist

# Health check configuration
HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

# Switch to non-root user for security
USER node

# Expose production port 3000
EXPOSE 3000

# Start compiled CommonJS server with persistent SQLite disk mount
CMD ["node", "dist/server.cjs"]
