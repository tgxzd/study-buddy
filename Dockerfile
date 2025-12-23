# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build the app
RUN yarn build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install dependencies for runtime
RUN apk add --no-cache openssl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 remix

# Copy necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/app ./app

# Set permissions
RUN chown -R remix:nodejs /app

USER remix

EXPOSE 3000

ENV NODE_ENV=production

# Run db push (creates tables from schema), generate Prisma client, then start server
CMD ["sh", "-c", "yarn prisma db push --skip-generate && yarn prisma generate && yarn start"]
