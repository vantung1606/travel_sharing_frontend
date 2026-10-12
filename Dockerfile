# ==========================================
# STAGE 1: Build React (Vite) Application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies with layer caching
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_WS_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GEMINI_API_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

# Copy source files and compile production bundle
COPY . .
RUN npm run build

# ==========================================
# STAGE 2: Production Nginx Web Server
# ==========================================
FROM nginx:alpine

# Clean up default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
