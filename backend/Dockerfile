FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && addgroup --system app \
    && adduser --system --ingroup app app

COPY app ./app
COPY alembic ./alembi
# ==========================================
# MediKart - FastAPI Backend Dockerfile
# ==========================================

FROM python:3.12-slim

# Python configuration
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Application directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for Docker caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create non-root application user
RUN groupadd --system app && \
    useradd --system --gid app --home-dir /app app

# Copy backend application
COPY --chown=app:app app/ ./app/

# Copy Alembic migration files if available
COPY --chown=app:app alembic/ ./alembic/
COPY --chown=app:app alembic.ini ./alembic.ini

# Copy application data if available
COPY --chown=app:app data/ ./data/

# Create required directories
RUN mkdir -p /app/uploads /app/logs && \
    chown -R app:app /app/uploads /app/logs /app/data

# Use non-root user
USER app

# Expose FastAPI port
EXPOSE 8000

# Start FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

COPY alembic.ini .
COPY data ./data

RUN mkdir -p /app/uploads && chown app:app /app/uploads

USER app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
