# Build stage using official Bun Alpine base image
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Install dependencies into temp directory to maximize layer caching
FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy production dependencies and application source into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY package.json .
COPY server.js .
COPY app.js .
COPY src ./src

# Expose backend port
EXPOSE 5000

# Set environment defaults
ENV PORT=5000
ENV NODE_ENV=production

# Run application using Bun runtime
USER bun
CMD ["bun", "run", "server.js"]
