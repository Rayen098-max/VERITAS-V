FROM python:3.11-slim

# Prevent interactive prompts during apt install
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Install system dependencies: FFmpeg and OpenCV runtime libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency definition
COPY requirements.txt .

# Install dependencies (install headless OpenCV to keep image tiny and fast)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
    fastapi \
    uvicorn \
    python-multipart \
    pydantic \
    requests \
    aiohttp \
    python-dotenv \
    openai \
    scenedetect \
    opencv-python-headless \
    pillow \
    google-generativeai

# Copy application source code
COPY . .

# Expose default port (Render uses PORT env variable, defaults to 8000 or 10000)
ENV PORT=8000
EXPOSE 8000

# Start FastAPI backend
CMD ["sh", "-c", "uvicorn src.server.app:app --host 0.0.0.0 --port ${PORT:-8000}"]
