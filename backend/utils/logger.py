import hashlib
import json
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.database import ThreatLog


def hash_content(content: str) -> str:
    return hashlib.sha256(content.encode()).hexdigest()


async def log_threat(
    db: AsyncSession,
    threat_type: str,
    severity: str,
    source: str,
    content: str,
    phi_detected: bool,
    phi_score: float,
    intent: str,
    action_taken: str,
    reason: str,
    agent_outputs: dict,
    recommended_fix: str = "",
    auto_fixed: bool = True,
    confidence_score: float = 0.0,
    similar_incidents: int = 0,
    similarity_note: str = "",
    zero_trust_mode: bool = False,
) -> ThreatLog:
    from sqlalchemy import select, func
    raw_hash = hash_content(content)

    result = await db.execute(
        select(func.count()).where(ThreatLog.raw_input_hash == raw_hash)
    )
    previous_occurrences = result.scalar() or 0

    log_entry = ThreatLog(
        threat_type=threat_type,
        severity=severity,
        source=source,
        raw_input_hash=raw_hash,
        phi_detected=phi_detected,
        phi_score=phi_score,
        intent=intent,
        action_taken=action_taken,
        reason=reason,
        agent_outputs=json.dumps(agent_outputs),
        recommended_fix=recommended_fix,
        auto_fixed=auto_fixed,
        previous_occurrences=previous_occurrences,
        confidence_score=confidence_score,
        similar_incidents=similar_incidents,
        similarity_note=similarity_note,
        zero_trust_mode=zero_trust_mode,
    )

    db.add(log_entry)
    await db.commit()
    await db.refresh(log_entry)
    return log_entry
