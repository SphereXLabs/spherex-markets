# SphereX Markets — multi-stage production image (API + static UI)
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
# Serve from Express root — relative asset paths
ENV GITHUB_ACTIONS=
RUN npm run build

FROM node:20-alpine AS server-deps
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV SERVE_CLIENT=true
ENV CACHE_TTL=60

COPY server/package.json server/package-lock.json ./server/
COPY --from=server-deps /app/server/node_modules ./server/node_modules
COPY server/ ./server/
COPY --from=client-build /app/client/dist ./client/dist

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/api/health || exit 1

WORKDIR /app/server
CMD ["node", "index.js"]
