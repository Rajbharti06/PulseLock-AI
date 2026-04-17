import asyncio
import hashlib
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from backend.agents.phi_detector import detect_phi
from backend.agents.intent_analyzer import analyze_intent
from backend.agents.threat_detector import detect_threat
from backend.agents.policy_engine import check_policy
from backend.agents.response_agent import execute_response
from backend.core.gateway import sanitize_input
from backend.utils.logger import log_threat
from backend.utils.notifier import send_critical_alert
from backend.models.database import ThreatLog


async def _get_similarity_context(db: AsyncSession, content: str, threat_type: str) -> tuple[int, int, str]:
    """Return (previous_occurrences_exact, similar_by_type_count, note)."""
    content_hash = hashlib.sha256(content.encode()).hexdigest()

    exact_result = await db.execute(
        select(func.count()).where(ThreatLog.raw_input_hash == content_hash)
    )
    exact_count = exact_result.scalar() or 0

    if threat_type and threat_type != "none":
        similar_result = await db.execute(
            select(func.count()).where(ThreatLog.threat_type == threat_type)
        )
        similar_count = similar_result.scalar() or 0
    else:
        similar_count = 0

    note = ""
    if exact_count > 0:
        note = f"Exact match: this specific content has been seen {exact_count} time{'s' if exact_count > 1 else ''} before."
    elif similar_count > 0:
        note = f"Pattern match: {similar_count} prior incident{'s' if similar_count > 1 else ''} of type '{threat_type.replace('_', ' ')}' detected in history."

    return exact_count, similar_count, note


async def run_pipeline(
    content: str,
    source: str,
    destination: str,
    user_role: str,
    db: AsyncSession,
    zero_trust: bool = False,
) -> dict:
    clean_content = sanitize_input(content)

    phi_result, threat_result = await asyncio.gather(
        detect_phi(clean_content),
        detect_threat(clean_content),
    )

    intent_result = await analyze_intent(clean_content, destination)

    preliminary_type = threat_result.get("threat_type", "none")
    exact_count, similar_count, similarity_note = await _get_similarity_context(
        db, clean_content, preliminary_type
    )
    previous_occurrences = exact_count

    policy_result = check_policy(
        phi_result=phi_result,
        intent_result=intent_result,
        threat_result=threat_result,
        destination=destination,
        user_role=user_role,
        source=source,
        previous_occurrences=previous_occurrences,
        zero_trust=zero_trust,
    )

    response_result = await execute_response(
        content=clean_content,
        policy_result=policy_result,
        phi_result=phi_result,
        intent_result=intent_result,
        threat_result=threat_result,
        similar_incidents=similar_count,
        similarity_note=similarity_note,
    )

    agent_outputs = {
        "phi_detector": phi_result,
        "intent_analyzer": intent_result,
        "threat_detector": threat_result,
        "policy_engine": {**policy_result, "signals": policy_result.get("signals", {})},
    }

    action = response_result["decision"]
    severity = policy_result["severity"]
    confidence = response_result.get("decision_confidence", policy_result.get("decision_confidence", 0.0))

    if action != "ALLOW":
        await log_threat(
            db=db,
            threat_type=response_result["threat_type"],
            severity=severity,
            source=source,
            content=clean_content,
            phi_detected=phi_result["phi_detected"],
            phi_score=phi_result["score"],
            intent=intent_result["intent"],
            action_taken=action,
            reason=policy_result["policy_reason"],
            agent_outputs=agent_outputs,
            recommended_fix=response_result["recommended_fix"],
            auto_fixed=action in ("BLOCK", "REDACT", "QUARANTINE"),
            confidence_score=confidence,
            similar_incidents=similar_count,
            similarity_note=similarity_note,
            zero_trust_mode=zero_trust,
        )

    if severity in ("high", "critical"):
        await send_critical_alert(
            threat_type=response_result["threat_type"],
            severity=severity,
            reason=policy_result["policy_reason"],
            action=action,
        )

    return {
        "action": action,
        "severity": severity,
        "phi_detected": phi_result["phi_detected"],
        "phi_score": phi_result["score"],
        "threat_type": response_result["threat_type"],
        "intent": intent_result["intent"],
        "reason": policy_result["policy_reason"],
        "explanation": response_result["explanation"],
        "recommended_fix": response_result["recommended_fix"],
        "redacted_content": response_result.get("redacted_content"),
        "agent_details": agent_outputs,
        "confidence": confidence,
        "similar_incidents": similar_count,
        "similarity_note": similarity_note,
        "zero_trust_active": zero_trust,
        "signals": policy_result.get("signals", {}),
    }
