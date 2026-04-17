import json
from backend.utils.llm_client import call_llm

SYSTEM_PROMPT = """You are a behavioral intent analysis expert for healthcare security.
Analyze the given action/content and determine the user's intent.
Consider context: what data is involved, what action is being taken, where data might go.

Categories:
- safe: normal legitimate healthcare activity
- risky: potentially problematic, requires monitoring
- dangerous: clear intent to misuse, leak, or steal data

Respond ONLY with valid JSON:
{
  "intent": "safe/risky/dangerous",
  "confidence": 0.0-1.0,
  "intent_signals": ["list of signals observed"],
  "explanation": "brief human-readable explanation"
}"""

_DANGER_SIGNALS = [
    "send to external",
    "forward to",
    "upload to external",
    "export to",
    "bypass",
    "ignore rules",
    "override",
    "delete logs",
    "without authorization",
    "without consent",
]

_RISKY_SIGNALS = [
    "bulk export",
    "all patient records",
    "download all",
    "print all",
    "copy all",
    "share with",
]


def _rule_based_intent(content: str, destination: str = "") -> tuple[str, float, list[str]]:
    content_lower = (content + " " + destination).lower()
    signals = []

    for sig in _DANGER_SIGNALS:
        if sig in content_lower:
            signals.append(sig)

    if signals:
        return "dangerous", min(0.5 + len(signals) * 0.15, 1.0), signals

    for sig in _RISKY_SIGNALS:
        if sig in content_lower:
            signals.append(sig)

    if signals:
        return "risky", min(0.4 + len(signals) * 0.1, 0.85), signals

    return "safe", 0.2, []


async def analyze_intent(content: str, destination: str = "", context: dict = {}) -> dict:
    rule_intent, rule_conf, rule_signals = _rule_based_intent(content, destination)

    user_msg = f"Content: {content[:2000]}\nDestination: {destination or 'internal'}\nContext: {json.dumps(context)}"
    try:
        llm_raw = await call_llm(SYSTEM_PROMPT, user_msg)
        llm_result = json.loads(llm_raw)
    except Exception:
        llm_result = {
            "intent": rule_intent,
            "confidence": rule_conf,
            "intent_signals": rule_signals,
            "explanation": "Rule-based analysis only",
        }

    intent_priority = {"dangerous": 3, "risky": 2, "safe": 1}
    llm_intent = llm_result.get("intent", "safe")
    final_intent = rule_intent if intent_priority[rule_intent] >= intent_priority[llm_intent] else llm_intent
    final_confidence = max(rule_conf, llm_result.get("confidence", 0.0))
    combined_signals = list(set(rule_signals + llm_result.get("intent_signals", [])))

    return {
        "intent": final_intent,
        "confidence": round(final_confidence, 3),
        "intent_signals": combined_signals,
        "explanation": llm_result.get("explanation", ""),
    }
