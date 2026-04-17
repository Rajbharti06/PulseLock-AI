import json
from datetime import datetime, timedelta
from collections import Counter
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.database import ThreatLog, MonthlyReport, LearningLog
from backend.utils.llm_client import call_llm

REPORT_PROMPT = """You are PulseLock AI generating a monthly security intelligence report.
Based on the statistics below, write a professional, clear security report.
Include: key findings, trends, attack patterns, and 3 specific recommendations.
Use markdown formatting. Keep it concise and actionable."""


async def generate_monthly_report(db: AsyncSession, period: str = None) -> dict:
    if period is None:
        period = datetime.utcnow().strftime("%B %Y")

    since = datetime.utcnow() - timedelta(days=30)
    result = await db.execute(select(ThreatLog).where(ThreatLog.timestamp >= since))
    logs = result.scalars().all()

    total = len(logs)
    auto_resolved = sum(1 for l in logs if l.auto_fixed)
    escalated = sum(1 for l in logs if not l.auto_fixed and l.severity in ("high", "critical"))

    type_counter = Counter(l.threat_type for l in logs)
    severity_counter = Counter(l.severity for l in logs)
    source_counter = Counter(l.source for l in logs)

    stats = {
        "period": period,
        "total_threats": total,
        "auto_resolved": auto_resolved,
        "escalated": escalated,
        "resolution_rate": f"{(auto_resolved/total*100):.1f}%" if total else "0%",
        "threat_breakdown": dict(type_counter.most_common(6)),
        "severity_breakdown": dict(severity_counter),
        "attack_sources": dict(source_counter.most_common(4)),
    }

    learning_result = await db.execute(
        select(func.count(), func.sum(LearningLog.rules_updated))
        .where(LearningLog.timestamp >= since)
    )
    learning_row = learning_result.one()
    stats["learning_cycles"] = learning_row[0] or 0
    stats["rules_evolved"] = int(learning_row[1] or 0)

    try:
        report_md = await call_llm(REPORT_PROMPT, json.dumps(stats, indent=2), max_tokens=800)
    except Exception:
        report_md = _fallback_report(stats)

    report = MonthlyReport(
        period=period,
        report_content=report_md,
        total_threats=total,
        auto_resolved=auto_resolved,
        escalated=escalated,
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)

    return {
        "id": report.id,
        "period": period,
        "generated_at": report.generated_at.isoformat(),
        "stats": stats,
        "report_markdown": report_md,
    }


def _fallback_report(stats: dict) -> str:
    return f"""# PulseLock AI — Monthly Security Intelligence Report
**Period:** {stats['period']}

## Summary
- **Total Threats Detected:** {stats['total_threats']}
- **Auto-Resolved:** {stats['auto_resolved']} ({stats['resolution_rate']})
- **Escalated to Human:** {stats['escalated']}

## Threat Breakdown
{chr(10).join(f'- **{k}**: {v}' for k, v in stats['threat_breakdown'].items())}

## System Intelligence
- Learning cycles completed: {stats['learning_cycles']}
- Rules evolved: {stats['rules_evolved']}

## Recommendations
1. Review escalated incidents for manual resolution
2. Strengthen policies for most common attack vectors
3. Schedule a full security audit if escalation rate exceeds 10%
"""
