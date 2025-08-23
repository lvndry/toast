#!/bin/bash

# Toast AI Development Script
# Runs both frontend and backend simultaneously

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to cleanup background processes
cleanup() {
    print_status "Shutting down development servers..."

    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        print_status "Backend server stopped"
    fi

    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_status "Frontend server stopped"
    fi

    # Remove temporary files
    rm -f /tmp/toast_backend.pid /tmp/toast_frontend.pid

    print_success "Development environment cleaned up"
    exit 0
}

# Set up signal handlers for graceful shutdown
trap cleanup SIGINT SIGTERM

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."

    # Check for Python and uv
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is required but not installed"
        exit 1
    fi

    if ! command -v uv &> /dev/null; then
        print_error "uv is required but not installed. Install from https://docs.astral.sh/uv/getting-started/installation/"
        exit 1
    fi

    # Check for Node.js and bun
    if ! command -v node &> /dev/null; then
        print_error "Node.js is required but not installed"
        exit 1
    fi

    if ! command -v bun &> /dev/null; then
        print_error "bun is required but not installed. Install from https://bun.sh/"
        exit 1
    fi

    print_success "All dependencies are installed"
}

# Install backend dependencies
setup_backend() {
    print_status "Setting up backend..."
    cd apps/backend

    # Install dependencies using uv
    if [ ! -d ".venv" ]; then
        print_status "Creating virtual environment..."
        uv venv
    fi

    print_status "Installing backend dependencies..."
    uv sync

    cd ../..
    print_success "Backend setup complete"
}

# Install frontend dependencies
setup_frontend() {
    print_status "Setting up frontend..."
    cd apps/frontend

    print_status "Installing frontend dependencies..."
    bun install

    cd ../..
    print_success "Frontend setup complete"
}

# Start backend server
start_backend() {
    print_status "Starting backend server..."
    cd apps/backend

    # Activate virtual environment and start server
    source .venv/bin/activate
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    echo $BACKEND_PID > /tmp/toast_backend.pid

    cd ../..
    print_success "Backend server started on http://localhost:8000 (PID: $BACKEND_PID)"
}

# Start frontend server
start_frontend() {
    print_status "Starting frontend server..."
    cd apps/frontend

    # Start Next.js development server
    bun run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > /tmp/toast_frontend.pid

    cd ../..
    print_success "Frontend server started on http://localhost:3000 (PID: $FRONTEND_PID)"
}

# Wait for servers to be ready
wait_for_servers() {
    print_status "Waiting for servers to be ready..."

    # Wait for backend
    print_status "Waiting for backend server..."
    for i in {1..30}; do
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            print_success "Backend server is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Backend server failed to start within 30 seconds"
            cleanup
        fi
        sleep 1
    done

    # Wait for frontend
    print_status "Waiting for frontend server..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            print_success "Frontend server is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Frontend server failed to start within 30 seconds"
            cleanup
        fi
        sleep 1
    done
}

# Main execution
main() {
    echo "🚀 Starting Toast AI Development Environment"
    echo "=============================================="

    # Check dependencies
    check_dependencies

    # Setup both applications
    setup_backend
    setup_frontend

    # Start servers
    start_backend
    start_frontend

    # Wait for servers to be ready
    wait_for_servers

    echo ""
    echo "🎉 Development environment is ready!"
    echo "=============================================="
    echo "Frontend: http://localhost:3000"
    echo "Backend:  http://localhost:8000"
    echo "Health:   http://localhost:8000/health"
    echo ""
    echo "Press Ctrl+C to stop all servers"
    echo ""

    # Keep script running and monitor processes
    while true; do
        # Check if processes are still running
        if ! kill -0 $BACKEND_PID 2>/dev/null; then
            print_error "Backend server has stopped unexpectedly"
            cleanup
        fi

        if ! kill -0 $FRONTEND_PID 2>/dev/null; then
            print_error "Frontend server has stopped unexpectedly"
            cleanup
        fi

        sleep 5
    done
}

# Run main function
main
