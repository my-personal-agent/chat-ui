# ----------------------
# 1. Builder Stage
# ----------------------
FROM node:24.4-alpine3.22 AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy full app
COPY . .

# Build Next.js with standalone output
RUN pnpm build

# ----------------------
# 2. Production Runner
# ----------------------
FROM node:24.4-alpine3.22 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install pnpm
RUN npm install -g pnpm

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public


# Expose port
EXPOSE 3000

# Start Next.js app
CMD ["node", "server.js"]
