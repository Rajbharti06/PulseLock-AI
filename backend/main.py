from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.database import init_db, get_db, ThreatLog, User, MonthlyReport, RuleEvolution
from backend.models.schemas import (
    ScanRequest, ScanResult, EmailScanRequest, EmailScanResult,
    ThreatLogResponse, UserCreate, UserLogin, Token,
    SecurityAuditResult, LearningCycleResult, AgentA2ARequest,
)
from backend.core.orchestrator import run_pipeline
from backend.core.email_monitor import analyze_email
from backend.core.auth import hash_password, verify_password, create_token, get_current_user, require_role
from backend.monitoring.scheduler import start_scheduler, stop_scheduler
from backend.monitoring.anomaly_detector import detect_anomalies
from backend.monitoring.health_check import run_health_check
from backend.intelligence.self_learning import run_learning_cycle
from backend.intelligence.report_generator import generate_monthly_report
from backend.utils.notifier import register_ws, unregister_ws


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await _seed_admin()
    start_scheduler()
    yield
    stop_scheduler()


async def _seed_admin():
    from backend.models.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.username == "admin"))
        if not result.scalar_one_or_none():
            admin = User(username="admin", hashed_password=hash_password("admin123"), role="admin")
            db.add(admin)
            await db.commit()


app = FastAPI(
    title="PulseLock AI",
    description="Autonomous Healthcare Cyber Defense System",
    version="1.0.0",
    lifespan=lifespan,
)

_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://rajbharti06.github.io",
    *([o] if (o := __import__("os").getenv("EXTRA_CORS_ORIGIN")) else []),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/ping")
async def ping():
    return {"status": "ok"}


@app.post("/auth/register", response_model=Token)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == data.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already taken")
    user = User(username=data.username, hashed_password=hash_password(data.password), role=data.role)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return Token(access_token=create_token(user.id, user.role), role=user.role)


@app.post("/auth/login", response_model=Token)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == data.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return Token(access_token=create_token(user.id, user.role), role=user.role)


@app.post("/scan", response_model=ScanResult)
async def scan_content(
    request: ScanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await run_pipeline(
        content=request.content,
        source=request.source,
        destination=request.destination or "",
        user_role=current_user.role,
        db=db,
        zero_trust=request.zero_trust,
    )
    return ScanResult(
        action=result["action"],
        severity=result["severity"],
        phi_detected=result["phi_detected"],
        phi_score=result["phi_score"],
        threat_type=result.get("threat_type"),
        intent=result["intent"],
        reason=result["reason"],
        recommended_fix=result.get("recommended_fix"),
        redacted_content=result.get("redacted_content"),
        agent_details=result["agent_details"],
        explanation=result["explanation"],
        confidence=result.get("confidence", 0.0),
        similar_incidents=result.get("similar_incidents", 0),
        similarity_note=result.get("similarity_note"),
        zero_trust_active=result.get("zero_trust_active", False),
    )


@app.post("/scan/email", response_model=EmailScanResult)
async def scan_email(
    request: EmailScanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await analyze_email(request.sender, request.subject, request.body)


@app.post("/scan/a2a")
async def scan_agent_request(
    request: AgentA2ARequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """A2A endpoint — other AI agents call this to get security clearance."""
    result = await run_pipeline(
        content=f"Agent: {request.requesting_agent}\nAction: {request.action}\nData: {request.data}",
        source="api",
        destination=request.context.get("destination", ""),
        user_role=request.requesting_role,
        db=db,
    )
    return {
        "cleared": result["action"] == "ALLOW",
        "action": result["action"],
        "reason": result["explanation"],
        "severity": result["severity"],
    }


@app.get("/threats", response_model=list[ThreatLogResponse])
async def get_threats(
    limit: int = 50,
    severity: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(ThreatLog).order_by(desc(ThreatLog.timestamp)).limit(limit)
    if severity:
        query = query.where(ThreatLog.severity == severity)
    result = await db.execute(query)
    return result.scalars().all()


@app.get("/threats/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = await db.execute(select(func.count()).select_from(ThreatLog))
    blocked = await db.execute(select(func.count()).where(ThreatLog.action_taken == "BLOCK"))
    phi_leaks = await db.execute(select(func.count()).where(ThreatLog.phi_detected == True))
    critical = await db.execute(select(func.count()).where(ThreatLog.severity == "critical"))

    return {
        "total_events": total.scalar(),
        "blocked": blocked.scalar(),
        "phi_leak_attempts": phi_leaks.scalar(),
        "critical_threats": critical.scalar(),
        "last_checked": datetime.utcnow().isoformat(),
    }


@app.get("/audit", response_model=SecurityAuditResult)
async def run_audit(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "analyst")),
):
    result = await detect_anomalies(db)
    return SecurityAuditResult(
        status=result["status"],
        anomalies_found=result["anomalies_found"],
        details=result["details"],
        timestamp=datetime.utcnow(),
    )


@app.post("/intelligence/learn", response_model=LearningCycleResult)
async def trigger_learning(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    result = await run_learning_cycle(db)
    return LearningCycleResult(
        patterns_found=result["patterns_found"],
        rules_added=result["rules_added"],
        rules_updated=result["rules_updated"],
        summary=result["summary"],
        timestamp=datetime.utcnow(),
    )


@app.post("/intelligence/report")
async def trigger_report(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "analyst")),
):
    return await generate_monthly_report(db)


@app.get("/intelligence/reports")
async def list_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(MonthlyReport).order_by(desc(MonthlyReport.generated_at)).limit(12)
    )
    reports = result.scalars().all()
    return [
        {"id": r.id, "period": r.period, "generated_at": r.generated_at.isoformat(),
         "total_threats": r.total_threats, "auto_resolved": r.auto_resolved}
        for r in reports
    ]


@app.get("/health")
async def health(db: AsyncSession = Depends(get_db)):
    return await run_health_check(db)


@app.get("/rules")
async def get_rules(current_user: User = Depends(require_role("admin", "analyst"))):
    import json
    from pathlib import Path
    rules_path = Path("backend/data/rules.json")
    return json.loads(rules_path.read_text())


@app.get("/system/status")
async def system_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """System self-awareness: Stable / Learning / Under Threat."""
    from datetime import timedelta
    from sqlalchemy import select, func
    from backend.models.database import LearningLog

    since_1h = datetime.utcnow() - timedelta(hours=1)
    since_24h = datetime.utcnow() - timedelta(hours=24)

    critical_count = (await db.execute(
        select(func.count()).where(ThreatLog.timestamp >= since_1h, ThreatLog.severity == "critical")
    )).scalar() or 0

    high_count = (await db.execute(
        select(func.count()).where(ThreatLog.timestamp >= since_1h, ThreatLog.severity == "high")
    )).scalar() or 0

    recent_total = (await db.execute(
        select(func.count()).where(ThreatLog.timestamp >= since_1h)
    )).scalar() or 0

    recent_learning = (await db.execute(
        select(func.count()).where(LearningLog.timestamp >= since_24h)
    )).scalar() or 0

    if critical_count >= 2 or recent_total >= 15:
        status = "under_threat"
        status_label = "Under Threat"
        description = f"{critical_count} critical + {high_count} high severity events in the last hour. Active defense engaged."
        color = "critical"
    elif recent_learning > 0 or (high_count >= 1):
        status = "learning"
        status_label = "Learning"
        description = f"System processed {recent_total} events this hour and completed {recent_learning} learning cycle(s). Rules evolving."
        color = "medium"
    else:
        status = "stable"
        status_label = "Stable"
        description = f"{recent_total} events this hour. No critical threats. All systems nominal."
        color = "safe"

    return {
        "status": status,
        "status_label": status_label,
        "description": description,
        "color": color,
        "metrics": {
            "critical_last_hour": critical_count,
            "high_last_hour": high_count,
            "total_last_hour": recent_total,
            "learning_cycles_24h": recent_learning,
        },
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/intelligence/evolution")
async def get_rule_evolution(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "analyst")),
):
    result = await db.execute(
        select(RuleEvolution).order_by(desc(RuleEvolution.timestamp)).limit(limit)
    )
    evos = result.scalars().all()
    return [
        {
            "id": e.id,
            "timestamp": e.timestamp.isoformat(),
            "rule_type": e.rule_type,
            "change_description": e.change_description,
            "triggered_by": e.triggered_by,
            "confidence": e.confidence,
            "applied": e.applied,
        }
        for e in evos
    ]


@app.get("/threats/{threat_id}/timeline")
async def get_threat_timeline(
    threat_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(ThreatLog).where(ThreatLog.id == threat_id))
    threat = result.scalar_one_or_none()
    if not threat:
        raise HTTPException(status_code=404, detail="Threat not found")

    similar = await db.execute(
        select(ThreatLog)
        .where(ThreatLog.threat_type == threat.threat_type, ThreatLog.id != threat_id)
        .order_by(desc(ThreatLog.timestamp))
        .limit(5)
    )
    related = similar.scalars().all()

    return {
        "incident": {
            "id": threat.id,
            "timestamp": threat.timestamp.isoformat(),
            "threat_type": threat.threat_type,
            "severity": threat.severity,
            "source": threat.source,
            "action_taken": threat.action_taken,
            "reason": threat.reason,
            "phi_detected": threat.phi_detected,
            "confidence_score": threat.confidence_score,
            "similar_incidents": threat.similar_incidents,
            "similarity_note": threat.similarity_note,
            "recommended_fix": threat.recommended_fix,
        },
        "related_incidents": [
            {
                "id": r.id,
                "timestamp": r.timestamp.isoformat(),
                "threat_type": r.threat_type,
                "severity": r.severity,
                "action_taken": r.action_taken,
            }
            for r in related
        ],
        "timeline": [
            {"event": "Threat detected", "detail": f"{threat.threat_type} from {threat.source}"},
            {"event": "Agents analyzed", "detail": "PHI scan + Intent analysis + Threat detection ran in parallel"},
            {"event": f"Decision: {threat.action_taken}", "detail": threat.reason},
            {"event": "Logged", "detail": f"Confidence {threat.confidence_score:.0%} — {threat.similar_incidents} similar prior incidents"},
        ],
    }


@app.websocket("/ws/alerts")
async def alerts_websocket(websocket: WebSocket):
    await websocket.accept()
    register_ws(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        unregister_ws(websocket)
