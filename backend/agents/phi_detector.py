import re
import json
from pathlib import Path
from backend.utils.llm_client import call_llm

_RULES_PATH = Path(__file__).parent.parent / "data" / "rules.json"

SYSTEM_PROMPT = """You are a PHI (Protected Health Information) detection expert.
Analyze the given text and determine if it contains sensitive medical data.
PHI includes: patient names, DOB, SSN, medical record numbers, diagnosis,
prescriptions, insurance IDs, lab results, or any identifiable health information.

Respond ONLY with valid JSON in this exact format:
{
  "phi_detected": true/false,
  "score": 0.0-1.0,
  "phi_types": ["list of detected PHI types"],
  "reason": "brief explanation"
}"""


def _rule_based_phi_check(content: str) -> tuple[bool, float, list[str]]:
    rules = json.loads(_RULES_PATH.read_text())
    patterns = rules.get("phi_patterns", [])
    content_lower = content.lower()

    matched = [p for p in patterns if p in content_lower]
    regex_hits = [
        r"\b\d{3}-\d{2}-\d{4}\b",          # SSN
        r"\b\d{10,12}\b",                    # MRN / insurance ID
        r"\b(0[1-9]|1[0-2])[-/]\d{2}[-/]\d{4}\b",  # DOB
        r"\bpatient\s+id\s*[:#]?\s*\w+",    # Patient ID
    ]
    for pattern in regex_hits:
        if re.search(pattern, content, re.IGNORECASE):
            matched.append("regex_phi_pattern")

    score = min(len(matched) * 0.2, 1.0)
    return len(matched) > 0, score, list(set(matched))


async def detect_phi(content: str) -> dict:
    rule_detected, rule_score, rule_types = _rule_based_phi_check(content)

    try:
        llm_raw = await call_llm(SYSTEM_PROMPT, f"Analyze this text for PHI:\n\n{content[:3000]}")
        llm_result = json.loads(llm_raw)
    except Exception:
        llm_result = {
            "phi_detected": rule_detected,
            "score": rule_score,
            "phi_types": rule_types,
            "reason": "Rule-based detection only (LLM unavailable)",
        }

    final_score = max(rule_score, llm_result.get("score", 0.0))
    final_detected = rule_detected or llm_result.get("phi_detected", False)
    combined_types = list(set(rule_types + llm_result.get("phi_types", [])))

    return {
        "phi_detected": final_detected,
        "score": round(final_score, 3),
        "phi_types": combined_types,
        "reason": llm_result.get("reason", ""),
    }
