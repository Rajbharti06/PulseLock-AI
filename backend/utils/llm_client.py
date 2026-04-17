import httpx
from backend.utils.config import settings


OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


async def call_llm(system_prompt: str, user_message: str, max_tokens: int = 512) -> str:
    if not settings.OPENROUTER_API_KEY:
        raise RuntimeError("No LLM API key configured — using rule-based fallback")

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "HTTP-Referer": "https://pulselock.ai",
        "X-Title": "PulseLock AI",
        "Content-Type": "application/json",
    }

    payload = {
        "model": settings.OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "max_tokens": max_tokens,
        "temperature": 0.1,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(OPENROUTER_URL, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()


def _fallback_response(content: str) -> str:
    """Rule-based fallback when no API key is configured."""
    content_lower = content.lower()
    dangerous_phrases = ["ignore rules", "bypass", "export all", "send patient", "forward medical"]
    if any(p in content_lower for p in dangerous_phrases):
        return "DANGEROUS"
    phi_terms = ["patient", "diagnosis", "prescription", "medical record", "dob", "ssn"]
    if any(t in content_lower for t in phi_terms):
        return "PHI_DETECTED"
    return "SAFE"
