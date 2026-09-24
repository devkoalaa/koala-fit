FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
ARG GIT_COMMIT_SHA=local
ENV GIT_COMMIT_SHA=$GIT_COMMIT_SHA
ENV NEXT_TELEMETRY_DISABLED=1
# env.ts validates DATABASE_URL at import time, and `next build` imports the
# db client while collecting page data. It never connects, so a placeholder
# satisfies the schema; the real URL is only supplied at runtime.
RUN DATABASE_URL=postgres://build:build@localhost:5432/build pnpm build

# Runs drizzle-kit against the real database on each deploy (see compose).
FROM deps AS migrator
COPY drizzle.config.ts ./
COPY drizzle ./drizzle
COPY src/db/schema ./src/db/schema
CMD ["pnpm", "exec", "drizzle-kit", "migrate"]

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
ARG GIT_COMMIT_SHA=local
ENV GIT_COMMIT_SHA=$GIT_COMMIT_SHA
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder --chown=app:app /app/public ./public
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
USER app
EXPOSE 3000
CMD ["node", "server.js"]
