from datetime import datetime
from pathlib import Path
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

_RULES_PATH = Path(__file__).parent.parent / "data" / "rules.json"
_PATTERNS_PATH = Path(__file__).parent.parent / "data" / "threat_patterns.json"


async def run_health_check(db: AsyncSession) -> dict:
    issues = []

    try:
        await db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"error: {e}"
        issues.append("Database connectivity issue")

    rules_ok = _RULES_PATH.exists() and _PATTERNS_PATH.exists()
    if not rules_ok:
        issues.append("Rule files missing or corrupted")

    from backend.utils.config import settings
    llm_configured = bool(settings.OPENROUTER_API_KEY)

    overall = "healthy" if not issues else ("degraded" if len(issues) == 1 else "critical")

    return {
        "overall": overall,
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "database": db_status,
            "rule_files": "ok" if rules_ok else "missing",
            "llm_configured": llm_configured,
        },
        "issues": issues,
    }
