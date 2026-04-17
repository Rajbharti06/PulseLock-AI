import json
from pathlib import Path
from backend.utils.llm_client import call_llm

_RULES_PATH = Path(__file__).parent.parent / "data" / "rules.json"

SYSTEM_PROMPT = """You are a healthcare email security expert.
Analyze this email for phishing, social engineering, and data exfiltration attempts.
Healthcare phishing often uses: urgency about patient data, fake compliance alerts,
impersonation of doctors/admins, requests to click links or verify credentials.

Respond ONLY with valid JSON:
{
  "action": "ALLOW/SPAM/QUARANTINE/DELETE",
  "threat_type": "phishing|social_engineering|data_request|safe|none",
  "severity": "safe|low|medium|high|critical",
  "phishing_indicators": ["list of detected indicators"],
  "reason": "brief explanation"
}"""


async def analyze_email(sender: str, subject: str, body: str) -> dict:
    rules = json.loads(_RULES_PATH.read_text())
    indicators = rules.get("phishing_indicators", [])
    body_lower = (subject + " " + body).lower()

    rule_hits = [ind for ind in indicators if ind in body_lower]

    email_text = f"From: {sender}\nSubject: {subject}\nBody: {body[:2000]}"
    try:
        llm_raw = await call_llm(SYSTEM_PROMPT, email_text)
        result = json.loads(llm_raw)
    except Exception:
        if rule_hits:
            result = {
                "action": "SPAM",
                "threat_type": "phishing",
                "severity": "high",
                "phishing_indicators": rule_hits,
                "reason": f"Phishing indicators detected: {', '.join(rule_hits)}",
            }
        else:
            result = {
                "action": "ALLOW",
                "threat_type": "none",
                "severity": "safe",
                "phishing_indicators": [],
                "reason": "No threats detected",
            }

    if rule_hits and result.get("action") == "ALLOW":
        result["action"] = "SPAM"
        result["phishing_indicators"] = list(set(result.get("phishing_indicators", []) + rule_hits))

    return result
