# docker/Dockerfile
FROM node:20-slim AS base
RUN npm install -g pnpm

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter client build
RUN pnpm --filter server build

# 生产阶段
FROM base AS runner
WORKDIR /app

COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/packages/server/prisma ./prisma
COPY --from=builder /app/packages/server/package.json ./
COPY --from=builder /app/packages/client/dist ./public

RUN pnpm install --prod

ENV NODE_ENV=production
ENV DATABASE_URL="file:./data/taskflow.db"
ENV PORT=3000

RUN npx prisma generate

EXPOSE 3000
CMD ["node", "dist/index.js"]
