import json
from datetime import datetime, timedelta
from pathlib import Path
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.database import ThreatLog, LearningLog, RuleEvolution
from backend.intelligence.pattern_finder import find_patterns

_RULES_PATH = Path(__file__).parent.parent / "data" / "rules.json"
_PATTERNS_PATH = Path(__file__).parent.parent / "data" / "threat_patterns.json"
CONFIDENCE_THRESHOLD = 0.75
MIN_OCCURRENCES_FOR_RULE = 3


async def run_learning_cycle(db: AsyncSession) -> dict:
    since = datetime.utcnow() - timedelta(hours=24)
    result = await db.execute(
        select(ThreatLog).where(ThreatLog.timestamp >= since)
    )
    logs = result.scalars().all()

    if not logs:
        return {
            "patterns_found": 0, "rules_added": 0,
            "rules_updated": 0, "summary": "No new data to learn from.",
            "evolutions": [],
        }

    patterns = find_patterns(logs)
    rules = json.loads(_RULES_PATH.read_text())
    evolutions = []
    rules_added = 0
    rules_updated = 0

    for threat_type, count in patterns["threat_types"]:
        if count >= MIN_OCCURRENCES_FOR_RULE and threat_type not in ["none", "phi_exposure", "policy_violation"]:
            old_threshold = rules.get("risk_threshold", 0.65)
            new_threshold = max(old_threshold - 0.05, 0.40)
            if new_threshold != old_threshold:
                rules["risk_threshold"] = round(new_threshold, 2)
                rules_updated += 1
                desc = f"Risk threshold tightened from {old_threshold:.2f} → {new_threshold:.2f}"
                trigger = f"{count} incidents of type '{threat_type}' in 24h"
                confidence = min(0.5 + count * 0.1, 0.95)
                evolutions.append({"type": "threshold_update", "description": desc, "triggered_by": trigger, "confidence": confidence})

                evo = RuleEvolution(
                    rule_type="threshold_update",
                    change_description=desc,
                    triggered_by=trigger,
                    confidence=confidence,
                    applied=True,
                )
                db.add(evo)
                break

    phishing_logs = [l for l in logs if l.threat_type and "phishing" in l.threat_type]
    if len(phishing_logs) >= MIN_OCCURRENCES_FOR_RULE:
        reasons = [l.reason for l in phishing_logs if l.reason]
        new_phrases = _extract_new_block_phrases(reasons, rules.get("block_keywords", []))
        for phrase in new_phrases[:2]:
            rules.setdefault("block_keywords", []).append(phrase)
            rules_added += 1
            desc = f'New block keyword added: "{phrase}"'
            trigger = f"Extracted from {len(phishing_logs)} phishing incidents"
            evolutions.append({"type": "keyword_added", "description": desc, "triggered_by": trigger, "confidence": 0.78})
            evo = RuleEvolution(
                rule_type="keyword_added",
                change_description=desc,
                triggered_by=trigger,
                confidence=0.78,
                applied=True,
            )
            db.add(evo)

    rules["last_updated"] = datetime.utcnow().isoformat() + "Z"
    _RULES_PATH.write_text(json.dumps(rules, indent=2))

    summary = (
        f"Analyzed {len(logs)} events from last 24h. "
        f"Top threat: {patterns['top_threat']}. "
        f"Rules updated: {rules_updated}, keywords added: {rules_added}."
    )

    learning_log = LearningLog(
        patterns_found=len(patterns["threat_types"]),
        rules_added=rules_added,
        rules_updated=rules_updated,
        summary=summary,
    )
    db.add(learning_log)
    await db.commit()

    return {
        "patterns_found": len(patterns["threat_types"]),
        "rules_added": rules_added,
        "rules_updated": rules_updated,
        "summary": summary,
        "evolutions": evolutions,
    }


def _extract_new_block_phrases(reasons: list[str], existing_keywords: list[str]) -> list[str]:
    candidate_phrases = []
    for reason in reasons:
        words = reason.lower().split("|")
        for segment in words:
            segment = segment.strip()
            if len(segment) > 10 and segment not in existing_keywords:
                if any(kw in segment for kw in ["urgent", "transfer", "send", "immediately", "record"]):
                    candidate_phrases.append(segment[:60])

    seen = set()
    unique = []
    for p in candidate_phrases:
        key = p[:20]
        if key not in seen:
            seen.add(key)
            unique.append(p)
    return unique[:3]
