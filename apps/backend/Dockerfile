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

RUN pip install --no-cache-dir uv==0.4.30
RUN uv venv $VENV_PATH

COPY pyproject.toml ./
COPY uv.lock ./

RUN uv sync --no-dev --frozen

COPY . .

# Expose port
EXPOSE 8000

# Start the app
CMD ["uv","run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
