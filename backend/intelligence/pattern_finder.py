from collections import Counter
from backend.models.database import ThreatLog


def find_patterns(logs: list[ThreatLog]) -> dict:
    if not logs:
        return {"phrases": [], "threat_types": [], "sources": []}

    threat_type_counter = Counter(log.threat_type for log in logs)
    source_counter = Counter(log.source for log in logs)

    high_severity = [log for log in logs if log.severity in ("high", "critical")]

    return {
        "threat_types": threat_type_counter.most_common(5),
        "sources": source_counter.most_common(5),
        "high_severity_count": len(high_severity),
        "total_count": len(logs),
        "top_threat": threat_type_counter.most_common(1)[0][0] if threat_type_counter else "none",
    }
