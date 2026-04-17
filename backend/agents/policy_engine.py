import json
from pathlib import Path

_RULES_PATH = Path(__file__).parent.parent / "data" / "rules.json"


def _load_rules() -> dict:
    try:
        return json.loads(_RULES_PATH.read_text())
    except Exception:
        return {}


def _adaptive_severity(
    base_severity: str,
    phi_detected: bool,
    previous_occurrences: int,
    destination: str,
    threat_confidence: float,
) -> str:
    """Escalate severity based on context — repeated attacks + PHI = worse."""
    rank = {"safe": 0, "low": 1, "medium": 2, "high": 3, "critical": 4}
    level = rank.get(base_severity, 0)

    if previous_occurrences >= 3:
        level = min(level + 1, 4)
    if previous_occurrences >= 7:
        level = min(level + 1, 4)

    if phi_detected and destination and not destination.startswith("internal"):
        level = min(level + 1, 4)

    if threat_confidence >= 0.9:
        level = min(level + 1, 4)

    levels = ["safe", "low", "medium", "high", "critical"]
    return levels[level]


def check_policy(
    phi_result: dict,
    intent_result: dict,
    threat_result: dict,
    destination: str = "",
    user_role: str = "viewer",
    source: str = "ui",
    previous_occurrences: int = 0,
    zero_trust: bool = False,
) -> dict:
    rules = _load_rules()
    rbac = rules.get("rbac", {})
    role_perms = rbac.get(user_role, [])

    risk_threshold = rules.get("risk_threshold", 0.65)
    auto_block_threshold = rules.get("auto_block_threshold", 0.85)

    if zero_trust:
        risk_threshold = max(risk_threshold - 0.2, 0.35)
        auto_block_threshold = max(auto_block_threshold - 0.15, 0.60)

    allowed_domains = rules.get("allowed_external_domains", [])

    violations = []
    decision = "ALLOW"

    if threat_result["threat_detected"] and threat_result["confidence"] >= auto_block_threshold:
        violations.append(f"High-confidence threat detected: {threat_result['threat_type']}")
        decision = "BLOCK"

    if intent_result["intent"] == "dangerous":
        violations.append("Dangerous intent identified")
        decision = "BLOCK"

    if phi_result["phi_detected"] and destination:
        is_external = destination not in allowed_domains and not destination.startswith("internal")
        if is_external and "export" not in role_perms:
            violations.append(f"PHI cannot be sent to external destination: {destination}")
            decision = "BLOCK"

    if phi_result["phi_detected"] and "read" not in role_perms:
        violations.append(f"Role '{user_role}' does not have read permission for PHI data")
        decision = "BLOCK"

    if zero_trust and destination and not destination.startswith("internal"):
        if decision == "ALLOW":
            violations.append("Zero Trust: all external destinations blocked by policy")
            decision = "BLOCK"

    if intent_result["intent"] == "risky" and phi_result["phi_detected"]:
        if decision == "ALLOW":
            decision = "REDACT"
            violations.append("Risky intent with PHI detected — content will be redacted")

    if threat_result["severity"] in ("high", "critical") and decision == "ALLOW":
        decision = "QUARANTINE"
        violations.append(f"High severity threat '{threat_result['threat_type']}' requires quarantine")

    combined_risk = (
        phi_result["score"] * 0.25
        + intent_result["confidence"] * 0.30
        + threat_result["confidence"] * 0.45
    )

    if combined_risk >= risk_threshold and decision == "ALLOW":
        decision = "WARN"
        violations.append(f"Combined risk score {combined_risk:.2f} exceeds threshold")

    base_severity_map = {
        "ALLOW": "safe",
        "WARN": "low",
        "REDACT": "medium",
        "QUARANTINE": "high",
        "BLOCK": "high",
    }
    base_severity = base_severity_map.get(decision, "safe")

    final_severity = _adaptive_severity(
        base_severity=base_severity,
        phi_detected=phi_result["phi_detected"],
        previous_occurrences=previous_occurrences,
        destination=destination,
        threat_confidence=threat_result["confidence"],
    )

    decision_confidence = round(
        min(combined_risk + (0.1 if decision != "ALLOW" else 0.0), 1.0), 3
    )
    if decision == "BLOCK" and intent_result["intent"] == "dangerous":
        decision_confidence = max(decision_confidence, intent_result["confidence"])

    return {
        "decision": decision,
        "severity": final_severity,
        "violations": violations,
        "combined_risk_score": round(combined_risk, 3),
        "decision_confidence": decision_confidence,
        "policy_reason": " | ".join(violations) if violations else "All policy checks passed",
        "zero_trust_active": zero_trust,
        "signals": {
            "phi_score": phi_result["score"],
            "threat_confidence": threat_result["confidence"],
            "intent_confidence": intent_result["confidence"],
            "previous_occurrences": previous_occurrences,
        },
    }
