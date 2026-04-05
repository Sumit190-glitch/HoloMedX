FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for ifcopenshell and general compilation
RUN apt-get update && apt-get install -y \
    build-essential \
    libxml2-dev \
    libxslt-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose port (used by web service)
EXPOSE 8000

# The command is provided by docker-compose (uvicorn for web, celery for worker)
