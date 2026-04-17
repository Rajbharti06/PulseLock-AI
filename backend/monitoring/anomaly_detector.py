from datetime import datetime, timedelta
from collections import Counter
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.database import ThreatLog


async def detect_anomalies(db: AsyncSession) -> dict:
    since = datetime.utcnow() - timedelta(hours=1)
    result = await db.execute(select(ThreatLog).where(ThreatLog.timestamp >= since))
    recent_logs = result.scalars().all()

    anomalies = []
    severity_counts = Counter(l.severity for l in recent_logs)

    if severity_counts.get("critical", 0) >= 3:
        anomalies.append(f"CRITICAL: {severity_counts['critical']} critical threats in last hour")

    if len(recent_logs) > 20:
        anomalies.append(f"SPIKE: {len(recent_logs)} threat events detected in last hour (normal: <5)")

    phi_leak_attempts = sum(1 for l in recent_logs if l.phi_detected and l.action_taken == "BLOCK")
    if phi_leak_attempts >= 5:
        anomalies.append(f"PHI ATTACK: {phi_leak_attempts} PHI exfiltration attempts in last hour")

    injection_attempts = sum(1 for l in recent_logs if "injection" in (l.threat_type or ""))
    if injection_attempts >= 3:
        anomalies.append(f"INJECTION STORM: {injection_attempts} prompt injection attempts detected")

    if not anomalies:
        status = "safe"
    elif any("CRITICAL" in a for a in anomalies):
        status = "critical"
    else:
        status = "warning"

    return {
        "status": status,
        "anomalies_found": len(anomalies),
        "details": anomalies,
        "timestamp": datetime.utcnow().isoformat(),
        "events_analyzed": len(recent_logs),
    }
