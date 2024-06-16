FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# RUN corepack enable

FROM base AS build
COPY . /app
WORKDIR /app
RUN npm install -g pnpm@9 turbo ts-node
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

ENV NODE_ENV="production"
ENV JWT_SECRET="$JWT_SECRET"
ENV JWT_COOKIE_NAME="$JWT_COOKIE_NAME"
ENV JWT_TTL_SECS="$JWT_TTL_SECS"
ENV REFRESH_JWT_COOKIE_NAME="$REFRESH_JWT_COOKIE_NAME"
ENV REFRESH_JWT_TTL_SECS="$REFRESH_JWT_TTL_SECS"
ENV REDIS_HOST="$REDIS_HOST"
ENV REDIS_DB="$REDIS_DB"
ENV PAGINATION_LIMIT="$PAGINATION_LIMIT"
ENV PAGINATION_LIMIT_MAX="$PAGINATION_LIMIT_MAX"
ENV NEXT_PUBLIC_API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL"
ENV POSTGRES_DATABASE="$POSTGRES_DATABASE"
ENV POSTGRES_USERNAME="$POSTGRES_USERNAME"
ENV POSTGRES_PASSWORD="$POSTGRES_PASSWORD"
ENV POSTGRES_HOST="$POSTGRES_HOST"
ENV POSTGRES_INITIALIZE_TABLES="$POSTGRES_INITIALIZE_TABLES"
ENV POSTGRES_CLIENT_MIN_MESSAGES="$POSTGRES_CLIENT_MIN_MESSAGES"
ENV POSTGRES_SEED_DB="$POSTGRES_SEED_DB"
ENV POSTGRES_SEED_ROWS="$POSTGRES_SEED_ROWS"

RUN turbo build --filter='api' --filter='stockbase' --filter='worker'

# Expose the necessary ports for the services (api and stockbase)
EXPOSE 5001
EXPOSE 3000

# The default command will be overridden in the docker-compose file
CMD ["sh", "-c", "echo 'Image built successfully'"]