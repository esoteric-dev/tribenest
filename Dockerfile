# Use Node.js 23 as base image
FROM node:23-alpine AS base

# Install nginx for reverse proxy
RUN apk add --no-cache nginx


# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/client/package.json ./apps/client/
COPY apps/admin/package.json ./apps/admin/
COPY packages/frontend-shared/package.json ./packages/frontend-shared/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies
RUN npm ci

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy node_modules (from deps stage which has all dependencies)
COPY --from=deps /app/node_modules ./node_modules

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/client/package.json ./apps/client/
COPY apps/admin/package.json ./apps/admin/
COPY packages/frontend-shared/package.json ./packages/frontend-shared/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Copy pre-built artifacts from local machine
COPY apps/backend/build ./apps/backend/build
COPY apps/backend/src/db/_migration ./apps/backend/src/db/_migration
COPY apps/backend/src/configuration ./apps/backend/src/configuration
COPY apps/admin/dist ./apps/admin/dist
COPY apps/client/.next ./apps/client/.next
COPY apps/client/public ./apps/client/public
COPY packages ./packages

# Install only production dependencies
RUN npm ci --only=production --ignore-scripts

# Copy startup script
COPY scripts/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose only the proxy port
EXPOSE 80

# Start all applications
CMD ["/app/start.sh"]
