# Stage 1: Recipes
FROM lukemathwalker/cargo-chef:latest-rust-1.75.0 AS chef
WORKDIR /app

# Stage 2: Planner
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# Stage 3: Builder
FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this is cached
RUN cargo chef cook --release --recipe-path recipe.json
# Build application
COPY . .
RUN cargo build --release --bin cadmus-api

# Stage 4: Runtime
FROM debian:bookworm-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/cadmus-api /app/cadmus-api
# Expose the port
EXPOSE 3000
ENTRYPOINT ["./cadmus-api"]
