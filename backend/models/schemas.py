from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal
import uuid


class ScanRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=50000)
    source: Literal["upload", "email", "api", "ui", "message"] = "ui"
    destination: Optional[str] = None
    user_role: str = "viewer"
    zero_trust: bool = False


class ScanResult(BaseModel):
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    action: Literal["ALLOW", "BLOCK", "REDACT", "QUARANTINE", "WARN"]
    severity: Literal["safe", "low", "medium", "high", "critical"]
    phi_detected: bool
    phi_score: float
    threat_type: Optional[str]
    intent: str
    reason: str
    recommended_fix: Optional[str]
    redacted_content: Optional[str] = None
    agent_details: dict
    explanation: Optional[str] = None
    confidence: float = 0.0
    similar_incidents: int = 0
    similarity_note: Optional[str] = None
    zero_trust_active: bool = False


class EmailScanRequest(BaseModel):
    sender: str
    subject: str
    body: str
    attachments: list[str] = []


class EmailScanResult(BaseModel):
    action: Literal["ALLOW", "SPAM", "QUARANTINE", "DELETE"]
    threat_type: Optional[str]
    severity: str
    reason: str
    phishing_indicators: list[str]


class ThreatLogResponse(BaseModel):
    id: str
    timestamp: datetime
    threat_type: str
    severity: str
    source: str
    phi_detected: bool
    intent: str
    action_taken: str
    reason: str
    resolved: bool
    auto_fixed: bool

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    role: Literal["admin", "doctor", "analyst", "viewer"] = "viewer"


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class SecurityAuditResult(BaseModel):
    status: Literal["safe", "warning", "critical"]
    anomalies_found: int
    details: list[str]
    timestamp: datetime


class LearningCycleResult(BaseModel):
    patterns_found: int
    rules_added: int
    rules_updated: int
    summary: str
    timestamp: datetime


class AgentA2ARequest(BaseModel):
    requesting_agent: str
    action: str
    data: str
    context: dict = {}
    requesting_role: str = "viewer"
