"""
PulseLock A2A Server — Prompt Opinion integration entry point.

Run locally:
    python -m pulselock_agent.app

Agent card (Prompt Opinion discovery endpoint):
    http://localhost:8001/.well-known/agent-card.json

A2A JSON-RPC endpoint:
    POST http://localhost:8001/
"""
import os
import uvicorn
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from a2a.types import AgentCard, AgentCapabilities, AgentSkill
from a2a.server.apps import A2AStarletteApplication
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore

from google.adk.a2a.executor.a2a_agent_executor import A2aAgentExecutor
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.artifacts import InMemoryArtifactService
from google.adk.memory import InMemoryMemoryService

from pulselock_agent.agent import root_agent

# Environment-driven URL — critical for Cloud Run where the public URL
# is different from localhost. Set AGENT_PUBLIC_URL after first deploy.
_port = int(os.getenv("AGENT_PORT", "8001"))
_public_url = os.getenv(
    "AGENT_PUBLIC_URL",
    f"{os.getenv('PULSELOCK_AGENT_PROTOCOL', 'http')}://{os.getenv('PULSELOCK_AGENT_HOST', 'localhost')}:{_port}/",
)

_VALID_KEYS = set(filter(None, os.getenv("API_KEYS", "").split(",")))
if os.getenv("API_KEY_PRIMARY"):
    _VALID_KEYS.add(os.getenv("API_KEY_PRIMARY"))

_CARD_PATH = "/.well-known/agent-card.json"


class ApiKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if not _VALID_KEYS or request.url.path in (_CARD_PATH, "/.well-known/agent.json"):
            return await call_next(request)
        key = request.headers.get("X-API-Key", "")
        if not key:
            return JSONResponse({"error": "X-API-Key header is required"}, status_code=401)
        if key not in _VALID_KEYS:
            return JSONResponse({"error": "Invalid API key"}, status_code=403)
        return await call_next(request)


_card = AgentCard(
    name="PulseLock Security Agent",
    description=(
        "Autonomous healthcare cybersecurity gate. "
        "Scans PHI, detects threats, and enforces HIPAA compliance "
        "as a pre-execution checkpoint for every healthcare AI workflow. "
        "No agent action executes without PulseLock clearance."
    ),
    url=_public_url,
    version="1.0.0",
    default_input_modes=["text/plain", "application/json"],
    default_output_modes=["application/json"],
    capabilities=AgentCapabilities(streaming=True),
    skills=[
        AgentSkill(
            id="scan_content",
            name="PHI & Threat Scanner",
            description="Scan any text or data payload for PHI exposure and HIPAA violations before execution.",
            tags=["security", "phi", "hipaa", "healthcare"],
            examples=["Scan this patient message for PHI", "Is this data safe to send?"],
        ),
        AgentSkill(
            id="scan_email",
            name="Email Security Guard",
            description="Detect phishing, malware, and PHI leakage in healthcare emails before delivery.",
            tags=["email", "phishing", "security", "healthcare"],
            examples=["Check this email for phishing", "Is this email safe to open?"],
        ),
        AgentSkill(
            id="request_agent_clearance",
            name="Agent Clearance Gate",
            description="Request security clearance before one AI agent delegates a sensitive action to another.",
            tags=["a2a", "clearance", "authorization", "multi-agent"],
            examples=["Can DiagnosisAgent read patient record #1234?", "Approve this agent action"],
        ),
        AgentSkill(
            id="get_security_summary",
            name="Security Posture Report",
            description="Get real-time system security status: threats blocked, PHI leak attempts, critical incidents.",
            tags=["monitoring", "dashboard", "reporting"],
            examples=["What's the current threat level?", "How many PHI leaks were blocked today?"],
        ),
        AgentSkill(
            id="get_patient_data",
            name="FHIR Patient Data Fetcher",
            description="Retrieve FHIR patient records from the connected EHR for security analysis.",
            tags=["fhir", "ehr", "patient", "healthcare"],
            examples=["Fetch this patient's records before scanning", "Get patient conditions from FHIR"],
        ),
    ],
)

_runner = Runner(
    app_name="pulselock_security_agent",
    agent=root_agent,
    session_service=InMemorySessionService(),
    artifact_service=InMemoryArtifactService(),
    memory_service=InMemoryMemoryService(),
)

_executor = A2aAgentExecutor(runner=_runner)
_handler = DefaultRequestHandler(
    agent_executor=_executor,
    task_store=InMemoryTaskStore(),
)

_a2a = A2AStarletteApplication(agent_card=_card, http_handler=_handler)
app = Starlette(
    routes=_a2a.routes(),
    middleware=[Middleware(ApiKeyMiddleware)],
)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=_port)
