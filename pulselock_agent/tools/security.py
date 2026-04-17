import os
import httpx
from google.adk.tools import ToolContext

PULSELOCK_URL = os.getenv("PULSELOCK_URL", "http://localhost:8000")
_token: dict = {}


def _auth() -> dict:
    if not _token.get("value"):
        r = httpx.post(
            f"{PULSELOCK_URL}/auth/login",
            json={
                "username": os.getenv("PULSELOCK_USERNAME", "admin"),
                "password": os.getenv("PULSELOCK_PASSWORD", "admin123"),
            },
            timeout=10,
        )
        r.raise_for_status()
        _token["value"] = r.json()["access_token"]
    return {"Authorization": f"Bearer {_token['value']}"}


def _call(method: str, path: str, **kwargs) -> dict:
    """Make an authenticated request, retrying once on 401 with a fresh token."""
    headers = _auth()
    r = httpx.request(method, f"{PULSELOCK_URL}{path}", headers=headers, timeout=15, **kwargs)
    if r.status_code == 401:
        _token.clear()
        r = httpx.request(method, f"{PULSELOCK_URL}{path}", headers=_auth(), timeout=15, **kwargs)
    r.raise_for_status()
    return r.json()


def scan_content(
    content: str,
    source: str = "agent",
    destination: str = "",
    tool_context: ToolContext = None,
) -> dict:
    """Scan any text or data payload for PHI exposure, threats, and HIPAA policy violations.

    Call this before processing or transmitting any patient-related content.
    Returns decision: ALLOW | BLOCK | REDACT | QUARANTINE | WARN, plus confidence and reason.
    """
    patient_id = tool_context.state.get("patient_id", "") if tool_context else ""

    try:
        d = _call(
            "POST",
            "/scan",
            json={
                "content": content,
                "source": "api",
                "destination": destination,
                "zero_trust": bool(patient_id),
            },
        )
        return {
            "decision": d["action"],
            "confidence": d.get("confidence", 0),
            "phi_detected": d.get("phi_detected", False),
            "threat_type": d.get("threat_type") or "none",
            "reason": d.get("reason", ""),
            "explanation": d.get("explanation", ""),
            "recommended_fix": d.get("recommended_fix"),
            "patient_context": patient_id or "no patient context",
        }
    except Exception as e:
        return {
            "decision": "BLOCK",
            "confidence": 1.0,
            "phi_detected": False,
            "reason": f"Security gate unavailable — blocking by default: {e}",
        }


def scan_email(
    sender: str,
    subject: str,
    body: str,
    tool_context: ToolContext = None,
) -> dict:
    """Scan an email for phishing, malware links, PHI leakage, and healthcare compliance violations.

    Use this before any email is sent or processed in a healthcare workflow.
    Returns decision: ALLOW | SPAM | QUARANTINE | DELETE.
    """
    try:
        d = _call(
            "POST",
            "/scan/email",
            json={"sender": sender, "subject": subject, "body": body, "attachments": []},
        )
        return {
            "decision": d["action"],
            "threat_type": d.get("threat_type") or "none",
            "severity": d.get("severity", "unknown"),
            "reason": d.get("reason", ""),
            "phishing_indicators": d.get("phishing_indicators", []),
        }
    except Exception as e:
        return {"decision": "QUARANTINE", "reason": f"Email scanner unavailable — quarantined by default: {e}"}


def request_agent_clearance(
    agent_name: str,
    action: str,
    data: str,
    tool_context: ToolContext = None,
) -> dict:
    """Request security clearance for an AI agent to perform a specific action on healthcare data.

    Use this when one AI agent wants to delegate a sensitive task to another agent.
    Returns cleared=True only if the action is safe and HIPAA-compliant.
    """
    patient_id = tool_context.state.get("patient_id", "") if tool_context else ""

    try:
        d = _call(
            "POST",
            "/scan/a2a",
            json={
                "requesting_agent": agent_name,
                "action": action,
                "data": data,
                "context": {"patient_id": patient_id},
                "requesting_role": "viewer",
            },
        )
        return {
            "cleared": d["cleared"],
            "decision": d["action"],
            "reason": d["reason"],
            "severity": d.get("severity", "unknown"),
        }
    except Exception as e:
        return {
            "cleared": False,
            "decision": "BLOCK",
            "reason": f"Clearance check failed — blocking by default: {e}",
        }


def get_security_summary(tool_context: ToolContext = None) -> dict:
    """Get the current security posture of the healthcare system.

    Returns total threats blocked, PHI leak attempts detected, and critical incident count.
    Use in clinical dashboards or automated security briefings.
    """
    try:
        return _call("GET", "/threats/stats")
    except Exception as e:
        return {"error": f"Could not fetch security summary: {e}"}
