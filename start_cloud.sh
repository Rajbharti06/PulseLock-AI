#!/bin/bash
# Production startup: PulseLock backend (internal) + A2A agent (external on 8080)
set -e

echo "[PulseLock] Starting backend on port 8000..."
PYTHONPATH=/app uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to be ready
for i in $(seq 1 15); do
    if curl -sf http://localhost:8000/ping > /dev/null 2>&1; then
        echo "[PulseLock] Backend ready"
        break
    fi
    echo "[PulseLock] Waiting for backend... ($i/15)"
    sleep 1
done

echo "[PulseLock] Starting A2A agent on port 8080..."
exec env \
    PULSELOCK_URL=http://localhost:8000 \
    AGENT_PORT=8080 \
    python -m pulselock_agent.app
