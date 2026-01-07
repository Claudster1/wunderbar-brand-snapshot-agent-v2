# Docker Setup Guide

This project includes Docker configuration for both development and production environments.

## Prerequisites

- Docker Desktop installed and running
- `.env.local` file configured with all required environment variables

## Quick Start

### Development Mode (with hot reload)

```bash
# Build and start development container
make docker-build-dev
make docker-dev-up

# Or use docker compose directly
docker compose -f docker-compose.dev.yml up
```

The app will be available at `http://localhost:3000` with hot reload enabled.

### Production Mode

```bash
# Build production image
make docker-build

# Start production container
make docker-dev

# Or start in detached mode
make docker-up
```

## Available Commands

### Production Commands

- `make docker-build` - Build the production Docker image
- `make docker-dev` - Start app in production mode (foreground)
- `make docker-up` - Start app in production mode (background)
- `make docker-stop` - Stop containers
- `make docker-reset` - Stop and remove all containers + volumes
- `make docker-logs` - View container logs

### Development Commands

- `make docker-build-dev` - Build development Docker image
- `make docker-dev-up` - Start app in development mode with hot reload
- `make docker-dev-up-d` - Start in development mode (background)
- `make docker-dev-stop` - Stop development containers
- `make docker-dev-logs` - View development logs

## Docker Files

- `Dockerfile` - Production-optimized multi-stage build
- `Dockerfile.dev` - Development image with hot reload
- `docker-compose.yml` - Production configuration
- `docker-compose.dev.yml` - Development configuration
- `.dockerignore` - Files excluded from Docker build context

## Environment Variables

All environment variables from `.env.local` are automatically loaded into the containers. Make sure your `.env.local` file is properly configured before starting Docker containers.

## Troubleshooting

### Container won't start

1. Check that Docker Desktop is running
2. Verify `.env.local` exists and has all required variables
3. Check logs: `make docker-logs` or `make docker-dev-logs`

### Port 3000 already in use

If port 3000 is already in use, you can change it in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Change 3001 to any available port
```

### Rebuild after dependency changes

```bash
make docker-reset
make docker-build
make docker-up
```

### View container status

```bash
docker compose ps
```

## Notes

- Development mode mounts your local code for hot reload
- Production mode uses optimized standalone Next.js build
- All environment variables are loaded from `.env.local`
- Containers run as non-root user for security
