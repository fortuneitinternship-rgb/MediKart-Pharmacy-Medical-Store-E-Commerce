
# ==========================================
# MediKart - Frontend Dockerfile
# React + Node.js + Nginx
# ==========================================

# Stage 1: Build React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy frontend source code
COPY . .

# Backend API URL
ARG REACT_APP_API_URL=http://localhost:8000
ENV REACT_APP_API_URL=$REACT_APP_API_URL

ENV CI=false

# Build React application
RUN npm run build


# Stage 2: Serve React using Nginx
FROM nginx:1.27-alpine

# Remove default Nginx configuration
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy React production build
COPY --from=build /app/build /usr/share/nginx/html

# Expose frontend port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
