# Use slim Python base image
FROM python:3.11-slim

# Set environment variables
ENV VENV_PATH="/opt/venv"
ENV PATH="$VENV_PATH/bin:$PATH"

# Install build dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv $VENV_PATH

# Install uv globally in the venv
RUN pip install --no-cache-dir uv==0.4.30

# Copy dependency files
COPY pyproject.toml ./
COPY uv.lock ./

# Install dependencies with uv
RUN uv sync --no-dev --frozen

# Copy app code
COPY . .

# Expose port (optional, depending on platform)
EXPOSE 8000

# Start the app (adjust `main:app` to your actual entrypoint)
CMD ["uv","run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
