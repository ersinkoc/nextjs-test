# Multi-stage Dockerfile for Next.js Test Arena
# Powered by Node.js 24 LTS (Krypton) builder & High-Performance Nginx Alpine runner

# ==========================================
# Stage 1: Build Stage
# ==========================================
FROM node:24-alpine AS builder

WORKDIR /app

# Set node environment for build
ENV NODE_ENV=production

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies needed for Vite & TypeScript build)
RUN npm ci

# Copy source code and configuration files
COPY . .

# Build production bundle with optimized static output
RUN npm run build

# ==========================================
# Stage 2: Production Runtime Stage (Nginx)
# ==========================================
FROM nginx:alpine AS runner

LABEL maintainer="Next.js Test Arena Team"
LABEL description="Production container for Next.js Test Arena with Node 24 LTS build & Nginx serving"

# Set working directory for web assets
WORKDIR /usr/share/nginx/html

# Clean default Nginx assets
RUN rm -rf ./*

# Copy built assets from builder stage
COPY --from=builder /app/dist .

# Copy custom Nginx configuration with SPA routing and security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/ || exit 1

# Expose production port 3000
EXPOSE 3000

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

