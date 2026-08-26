# Multi-stage Dockerfile for NextJS Playground App
# Built with Node.js 24 LTS and optimized Nginx runner

# Stage 1: Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy source code
COPY . .

# Build application for production
RUN npm run build

# Stage 2: Production runtime stage using lightweight Nginx
FROM nginx:alpine AS runner

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built assets from builder stage
COPY --from=builder /app/dist .

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
