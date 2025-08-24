# Toast AI Makefile
# Provides convenient commands for setting up and running the development environment

.PHONY: help setup dev clean install-deps setup-backend setup-frontend setup-precommit run-backend run-frontend test lint format check-deps

# Default target
help:
	@echo "🚀 Toast AI Development Commands"
	@echo "================================"
	@echo ""
	@echo "Setup Commands:"
	@echo "  make setup          - Complete project setup (dependencies, pre-commit, permissions)"
	@echo "  make install-deps   - Install all dependencies (backend + frontend)"
	@echo "  make setup-backend  - Setup backend only"
	@echo "  make setup-frontend - Setup frontend only"
	@echo "  make setup-precommit - Setup pre-commit hooks"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev            - Start development servers (frontend + backend)"
	@echo "  make run-backend    - Start backend server only"
	@echo "  make run-frontend   - Start frontend server only"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make test           - Run tests"
	@echo "  make lint           - Run linting"
	@echo "  make format         - Format code"
	@echo "  make clean          - Clean up temporary files"
	@echo "  make check-deps     - Check if required dependencies are installed"
	@echo ""

# Complete project setup
setup: check-deps setup-permissions install-deps setup-precommit
	@echo "✅ Toast AI setup complete!"
	@echo "Run 'make dev' to start the development environment"

# Install all dependencies
install-deps: setup-backend setup-frontend
	@echo "✅ All dependencies installed"

# Setup backend dependencies
setup-backend:
	@echo "🔧 Setting up backend..."
	@cd apps/backend && uv sync
	@echo "✅ Backend setup complete"

# Setup frontend dependencies
setup-frontend:
	@echo "🔧 Setting up frontend..."
	@cd apps/frontend && bun install
	@echo "✅ Frontend setup complete"

# Setup pre-commit hooks
setup-precommit: setup-permissions
	@echo "🔧 Setting up pre-commit hooks..."
	@./setup-precommit.sh

# Set executable permissions on scripts
setup-permissions:
	@echo "🔧 Setting executable permissions on scripts..."
	@chmod +x dev.sh
	@chmod +x setup-precommit.sh
	@chmod +x apps/backend/scripts/run_logo_update.sh
	@echo "✅ Script permissions set"

# Start development environment
dev: check-deps
	@echo "🚀 Starting Toast AI development environment..."
	@./dev.sh

# Start backend server only
run-backend: check-deps
	@echo "🚀 Starting backend server..."
	@cd apps/backend && source .venv/bin/activate && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Start frontend server only
run-frontend: check-deps
	@echo "🚀 Starting frontend server..."
	@cd apps/frontend && bun run dev

# Run tests
test:
	@echo "🧪 Running tests..."
	@cd apps/backend && source .venv/bin/activate && python -m pytest tests/ -v
	@cd apps/frontend && bun test

# Run linting
lint:
	@echo "🔍 Running linting..."
	@cd apps/backend && source .venv/bin/activate && ruff check .
	@cd apps/frontend && bun run lint

# Format code
format:
	@echo "🎨 Formatting code..."
	@cd apps/backend && source .venv/bin/activate && ruff format .
	@cd apps/frontend && bun run format

# Clean up temporary files
clean:
	@echo "🧹 Cleaning up temporary files..."
	@find . -type f -name "*.pyc" -delete
	@find . -type d -name "__pycache__" -delete
	@find . -type d -name "*.egg-info" -exec rm -rf {} +
	@find . -type d -name ".pytest_cache" -exec rm -rf {} +
	@find . -type d -name ".mypy_cache" -exec rm -rf {} +
	@find . -type d -name ".ruff_cache" -exec rm -rf {} +
	@rm -rf apps/backend/.venv
	@rm -rf apps/frontend/node_modules
	@rm -rf apps/frontend/.next
	@echo "✅ Cleanup complete"

# Check if required dependencies are installed
check-deps:
	@echo "🔍 Checking dependencies..."
	@command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed"; exit 1; }
	@command -v uv >/dev/null 2>&1 || { echo "❌ uv is required but not installed. Install from https://docs.astral.sh/uv/getting-started/installation/"; exit 1; }
	@command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed"; exit 1; }
	@command -v bun >/dev/null 2>&1 || { echo "❌ bun is required but not installed. Install from https://bun.sh/"; exit 1; }
	@echo "✅ All dependencies are installed"

# Database migration (if needed)
migrate:
	@echo "🗄️ Running database migrations..."
	@cd apps/backend && source .venv/bin/activate && python scripts/migrate_users.py

# Update company logos
update-logos:
	@echo "🖼️ Updating company logos..."
	@cd apps/backend && ./scripts/run_logo_update.sh

# Run dashboard
dashboard:
	@echo "📊 Starting dashboard..."
	@cd apps/backend && source .venv/bin/activate && python scripts/run_dashboard.py

# Stop dashboard
stop-dashboard:
	@echo "🛑 Stopping dashboard..."
	@cd apps/backend && source .venv/bin/activate && python scripts/stop_dashboard.py

# Production build
build:
	@echo "🏗️ Building for production..."
	@cd apps/backend && source .venv/bin/activate && python -m build
	@cd apps/frontend && bun run build

# Docker commands (if using Docker)
docker-build:
	@echo "🐳 Building Docker images..."
	@docker build -t toast-backend apps/backend/
	@docker build -t toast-frontend apps/frontend/

docker-run:
	@echo "🐳 Running with Docker Compose..."
	@docker-compose up -d

docker-stop:
	@echo "🐳 Stopping Docker containers..."
	@docker-compose down

# Development shortcuts
backend: run-backend
frontend: run-frontend
logs:
	@echo "📋 Showing logs..."
	@tail -f apps/backend/logs/*.log 2>/dev/null || echo "No log files found"

# Environment setup
env-setup:
	@echo "🔧 Setting up environment..."
	@if [ ! -f apps/backend/.env ]; then \
		echo "Creating backend .env file..."; \
		cp apps/backend/.env.example apps/backend/.env 2>/dev/null || echo "# Backend environment variables" > apps/backend/.env; \
	fi
	@if [ ! -f apps/frontend/.env.local ]; then \
		echo "Creating frontend .env.local file..."; \
		cp apps/frontend/.env.example apps/frontend/.env.local 2>/dev/null || echo "# Frontend environment variables" > apps/frontend/.env.local; \
	fi
	@echo "✅ Environment files created"

# Quick start for new developers
quick-start: env-setup setup dev
	@echo "🎉 Quick start complete! Development servers should be running."
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8000"
