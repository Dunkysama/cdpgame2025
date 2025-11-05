# syntax=docker/dockerfile:1.7

# --- Base image ---
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# next on alpine needs this for glibc-compat
RUN apk add --no-cache libc6-compat

# --- Dependencies layer ---
FROM base AS deps
# Only copy package manifests to leverage Docker layer caching
COPY package.json package-lock.json* ./
# Install dependencies (prefer clean CI install when lockfile exists)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# --- Development image (hot reload) ---
FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# --- Build stage ---
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Production runtime ---
FROM base AS runner
ENV NODE_ENV=production
# Copy only what's needed to run "next start"
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY package.json ./package.json
COPY next.config.mjs ./next.config.mjs
COPY public ./public
# If you serve static assets from /src/app or /src/pages public assets aren't required,
# but keeping them is safe and small.

EXPOSE 3000
CMD ["npm", "run", "start"]
