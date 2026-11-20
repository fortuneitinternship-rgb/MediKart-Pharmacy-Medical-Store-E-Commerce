# ==========================================
# MediKart - FastAPI Backend Dockerfile
# ==========================================
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Python dependencies first (better Docker layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Non-root user
RUN groupadd --system app && useradd --system --gid app --home-dir /app app

# Application code
COPY --chown=app:app app/ ./app/
COPY --chown=app:app alembic/ ./alembic/
COPY --chown=app:app alembic.ini init_db.py ./
COPY --chown=app:app data/ ./data/

RUN mkdir -p /app/uploads && chown -R app:app /app/uploads

USER app
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
