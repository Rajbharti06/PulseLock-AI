FROM python:3.11-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Install backend deps first (cached layer)
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Install agent deps
COPY agent_requirements.txt agent_requirements.txt
RUN pip install --no-cache-dir -r agent_requirements.txt

# Copy source
COPY backend/ backend/
COPY pulselock_agent/ pulselock_agent/
COPY start_cloud.sh start_cloud.sh
RUN chmod +x start_cloud.sh

# Cloud Run exposes one port — the A2A agent runs here.
# The PulseLock backend runs on 8000 (internal only).
EXPOSE 8080

CMD ["./start_cloud.sh"]
