import hashlib
import re
from fastapi import HTTPException


_MAX_CONTENT_LENGTH = 50000
_INJECTION_PATTERNS = [
    r"<script[^>]*>",
    r"javascript:",
    r"on\w+\s*=",
    r"\beval\s*\(",
    r"\bexec\s*\(",
]


def sanitize_input(content: str) -> str:
    if len(content) > _MAX_CONTENT_LENGTH:
        raise HTTPException(status_code=413, detail="Content exceeds maximum allowed size")

    for pattern in _INJECTION_PATTERNS:
        if re.search(pattern, content, re.IGNORECASE):
            content = re.sub(pattern, "[SANITIZED]", content, flags=re.IGNORECASE)

    return content.strip()


def fingerprint(content: str) -> str:
    return hashlib.sha256(content.encode()).hexdigest()[:16]


def validate_source(source: str) -> bool:
    valid_sources = {"upload", "email", "api", "ui", "message"}
    return source in valid_sources
