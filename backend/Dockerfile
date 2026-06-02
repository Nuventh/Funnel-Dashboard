# Production image for the funnel dashboard backend.
FROM node:20-slim

WORKDIR /app

# Install dependencies first (better layer caching). Uses the lockfile for
# reproducible, production-only installs.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application source and data.
COPY src/ src/
COPY data/ data/

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "src/server.js"]
