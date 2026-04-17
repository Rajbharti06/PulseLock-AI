#!/bin/bash
# Start PulseLock AI — backend, frontend, and A2A security agent

echo "Starting PulseLock AI..."

# Backend
cd backend
pip install -r requirements.txt -q
PYTHONPATH=.. uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Frontend
cd ../frontend
npm install -q
npm run dev &
FRONTEND_PID=$!

# A2A Security Agent (Prompt Opinion integration)
cd ..
if [ -f ".env.agent" ]; then
    export $(grep -v '^#' .env.agent | xargs)
fi
pip install -r agent_requirements.txt -q
python -m pulselock_agent.app &
AGENT_PID=$!

echo ""
echo "PulseLock AI is running:"
echo "  Backend API:      http://localhost:8000"
echo "  Frontend UI:      http://localhost:5173"
echo "  API Docs:         http://localhost:8000/docs"
echo "  A2A Agent:        http://localhost:8001"
echo "  Agent Card:       http://localhost:8001/.well-known/agent-card.json"
echo ""
echo "Default login: admin / admin123"
echo ""
echo "To register with Prompt Opinion:"
echo "  1. Deploy agent to public URL"
echo "  2. Submit Agent Card URL to Prompt Opinion marketplace"
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $BACKEND_PID $FRONTEND_PID $AGENT_PID 2>/dev/null" INT
wait
