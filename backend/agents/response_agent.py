import re
from backend.utils.llm_client import call_llm

_PHI_REDACT_PATTERNS = [
    (r"\b\d{3}-\d{2}-\d{4}\b", "[SSN REDACTED]"),
    (r"\b\d{10,12}\b", "[ID REDACTED]"),
    (r"\b(0[1-9]|1[0-2])[-/]\d{2}[-/]\d{4}\b", "[DOB REDACTED]"),
    (r"\b[A-Z][a-z]+ [A-Z][a-z]+\b", "[NAME REDACTED]"),
]

EXPLAIN_PROMPT = """You are PulseLock AI, an autonomous healthcare data security guardian.
A security decision was just made. Write a clear, human-grade explanation for the user.

Rules:
- Be direct, specific, and non-alarming
- Explain exactly WHY this decision was made (reference signals: PHI score, threat type, intent)
- If the action is BLOCK or QUARANTINE, explain what was dangerous
- If the action is ALLOW, briefly confirm what was verified safe
- Mention if this type of attack was seen before (use the similar_incidents field)
- End with one practical next step
- 2-3 sentences maximum, no jargon
"""


def redact_phi(content: str) -> str:
    redacted = content
    for pattern, replacement in _PHI_REDACT_PATTERNS:
        redacted = re.sub(pattern, replacement, redacted)
    return redacted


def _determine_threat_type(phi_result: dict, intent_result: dict, threat_result: dict) -> str:
    if threat_result["threat_detected"]:
        return threat_result["threat_type"]
    if phi_result["phi_detected"] and intent_result["intent"] == "dangerous":
        return "data_exfiltration"
    if phi_result["phi_detected"]:
        return "phi_exposure"
    return "policy_violation"


def _recommended_fix(threat_type: str) -> str:
    fixes = {
        "phishing": "Block the sender domain permanently and report to your security team.",
        "prompt_injection_rule_bypass": "Reject this instruction — your system rules cannot be overridden by user input.",
        "data_exfiltration": "Use only authorized internal channels. Contact your admin for secure export procedures.",
        "phi_exposure": "Ensure PHI is accessed only by authorized personnel and never transmitted externally.",
        "policy_violation": "Review your organization's data handling policies and retry with the correct role and permissions.",
        "credential_phishing": "Never enter credentials via email links. Use your official portal only.",
        "bulk_data_access_anomaly": "Bulk exports require administrator approval. Submit a formal data request.",
        "social_engineering": "Verify the requester's identity through official channels before sharing any data.",
    }
    return fixes.get(threat_type, "Review the flagged content and consult your security administrator before proceeding.")


def _build_fallback_explanation(
    decision: str,
    policy_result: dict,
    phi_result: dict,
    threat_result: dict,
    intent_result: dict,
    similar_incidents: int,
) -> str:
    signals = []

    if phi_result["phi_detected"]:
        signals.append(f"patient data detected ({int(phi_result['score'] * 100)}% confidence)")
    if threat_result["threat_detected"]:
        signals.append(f"{threat_result['threat_type'].replace('_', ' ')} pattern ({int(threat_result['confidence'] * 100)}% confidence)")
    if intent_result["intent"] in ("dangerous", "risky"):
        signals.append(f"{intent_result['intent']} intent")

    signal_str = ", ".join(signals) if signals else "risk indicators"

    repeat_note = ""
    if similar_incidents > 0:
        repeat_note = f" This attack pattern has been seen {similar_incidents} time{'s' if similar_incidents > 1 else ''} before — PulseLock blocked it instantly."

    if decision == "BLOCK":
        return f"Blocked due to {signal_str}.{repeat_note} This request violated security policy and was stopped before any data was exposed."
    if decision == "REDACT":
        return f"Sensitive patient information ({signal_str}) has been removed from this content before transmission to protect patient privacy."
    if decision == "QUARANTINE":
        return f"Content quarantined for review — {signal_str} detected.{repeat_note} No data was transmitted. A security analyst should review this incident."
    if decision == "WARN":
        return f"Elevated risk detected ({signal_str}). This action was permitted but flagged — monitor carefully and verify the destination is authorized."
    return f"Request cleared after verifying {signal_str or 'all security signals'}. No threats or policy violations detected."


async def execute_response(
    content: str,
    policy_result: dict,
    phi_result: dict,
    intent_result: dict,
    threat_result: dict,
    similar_incidents: int = 0,
    similarity_note: str = "",
) -> dict:
    decision = policy_result["decision"]
    violations = policy_result["violations"]
    threat_type = _determine_threat_type(phi_result, intent_result, threat_result)
    fix = _recommended_fix(threat_type)
    redacted_content = None

    if decision == "REDACT":
        redacted_content = redact_phi(content)

    explain_context = f"""
Decision: {decision}
Confidence: {policy_result.get('decision_confidence', 0):.0%}
Threat type: {threat_type.replace('_', ' ')}
Signals:
  - PHI detected: {phi_result['phi_detected']} (score: {phi_result['score']:.0%})
  - Threat confidence: {threat_result['confidence']:.0%}
  - Intent: {intent_result['intent']} (confidence: {intent_result['confidence']:.0%})
Violations: {', '.join(violations) if violations else 'None'}
Similar past incidents: {similar_incidents}
{f'Similarity note: {similarity_note}' if similarity_note else ''}
"""
    try:
        explanation = await call_llm(EXPLAIN_PROMPT, explain_context, max_tokens=180)
    except Exception:
        explanation = _build_fallback_explanation(
            decision, policy_result, phi_result, threat_result, intent_result, similar_incidents
        )

    return {
        "decision": decision,
        "threat_type": threat_type,
        "explanation": explanation,
        "recommended_fix": fix,
        "redacted_content": redacted_content,
        "decision_confidence": policy_result.get("decision_confidence", 0.0),
    }
