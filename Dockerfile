# ---------- Build stage ----------
FROM node:20-bullseye-slim AS build

WORKDIR /app

# Copy lockfile alongside package.json so npm ci can do a deterministic,
# cache-friendly install.  Changes to source code won't bust this layer.
COPY package.json package-lock.json ./

# npm ci is faster than npm install: it skips the dependency-resolution
# step entirely and installs exactly what the lockfile says.
RUN npm ci

# Now copy the rest of the source (cheap – .dockerignore keeps it small)
COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh

# Generate Prisma client files
RUN npx prisma generate

# Build the application
RUN npm run build

# ---------- Production stage ----------
FROM node:20-bullseye-slim AS production

WORKDIR /app

# Copy package files and install prod-only deps
COPY --from=build /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

# Copy the production build from the build stage
COPY --from=build /app/dist2 ./dist2
COPY --from=build /app/docker-entrypoint.sh ./

# Copy generated Prisma client
COPY --from=build /app/node_modules/.prisma/client ./node_modules/.prisma/client

# Copy Prisma schema and migrations
COPY --from=build /app/prisma ./prisma

# Expose the port on which your NestJS app is listening
ARG APP_PORT=3000
EXPOSE ${APP_PORT}

# Set NODE_ENV to production
ENV NODE_ENV=production

# Use the entry point script to start the container
ENTRYPOINT ["/app/docker-entrypoint.sh"]
