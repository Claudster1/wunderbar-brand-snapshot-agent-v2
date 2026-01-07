.PHONY: build dev start lint docker-build docker-dev docker-stop docker-reset docker-logs

# ============================================
# NPM/Next.js Commands
# ============================================

build:
	npm run build

dev:
	npm run dev

start:
	npm run start

lint:
	npm run lint

# ============================================
# Docker Commands (Production)
# ============================================

# Build the Docker image
docker-build:
	docker compose build

# Start app in production mode
docker-dev:
	docker compose up

# Start app in production mode (detached)
docker-up:
	docker compose up -d

# Stop containers
docker-stop:
	docker compose down

# Destroy all containers + volumes
docker-reset:
	docker compose down -v

# View logs
docker-logs:
	docker compose logs -f

# ============================================
# Docker Commands (Development)
# ============================================

# Build development Docker image
docker-build-dev:
	docker compose -f docker-compose.dev.yml build

# Start app in development mode with hot reload
docker-dev-up:
	docker compose -f docker-compose.dev.yml up

# Start app in development mode (detached)
docker-dev-up-d:
	docker compose -f docker-compose.dev.yml up -d

# Stop development containers
docker-dev-stop:
	docker compose -f docker-compose.dev.yml down

# View development logs
docker-dev-logs:
	docker compose -f docker-compose.dev.yml logs -f
