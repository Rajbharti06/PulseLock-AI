from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Float, Boolean, Text, DateTime, Integer
from datetime import datetime
import uuid
from backend.utils.config import settings


class Base(DeclarativeBase):
    pass


class ThreatLog(Base):
    __tablename__ = "threat_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    threat_type: Mapped[str] = mapped_column(String(50))
    severity: Mapped[str] = mapped_column(String(20))
    source: Mapped[str] = mapped_column(String(50))
    raw_input_hash: Mapped[str] = mapped_column(String(64))
    phi_detected: Mapped[bool] = mapped_column(Boolean, default=False)
    phi_score: Mapped[float] = mapped_column(Float, default=0.0)
    intent: Mapped[str] = mapped_column(String(30))
    action_taken: Mapped[str] = mapped_column(String(30))
    reason: Mapped[str] = mapped_column(Text)
    previous_occurrences: Mapped[int] = mapped_column(Integer, default=0)
    recommended_fix: Mapped[str] = mapped_column(Text, nullable=True)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    auto_fixed: Mapped[bool] = mapped_column(Boolean, default=False)
    agent_outputs: Mapped[str] = mapped_column(Text, nullable=True)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)
    similar_incidents: Mapped[int] = mapped_column(Integer, default=0)
    similarity_note: Mapped[str] = mapped_column(Text, nullable=True)
    zero_trust_mode: Mapped[bool] = mapped_column(Boolean, default=False)


class RuleEvolution(Base):
    __tablename__ = "rule_evolution"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    rule_type: Mapped[str] = mapped_column(String(50))
    change_description: Mapped[str] = mapped_column(Text)
    triggered_by: Mapped[str] = mapped_column(Text)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    applied: Mapped[bool] = mapped_column(Boolean, default=True)


class LearningLog(Base):
    __tablename__ = "learning_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    patterns_found: Mapped[int] = mapped_column(Integer, default=0)
    rules_added: Mapped[int] = mapped_column(Integer, default=0)
    rules_updated: Mapped[int] = mapped_column(Integer, default=0)
    summary: Mapped[str] = mapped_column(Text)


class MonthlyReport(Base):
    __tablename__ = "monthly_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    period: Mapped[str] = mapped_column(String(20))
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    report_content: Mapped[str] = mapped_column(Text)
    total_threats: Mapped[int] = mapped_column(Integer, default=0)
    auto_resolved: Mapped[int] = mapped_column(Integer, default=0)
    escalated: Mapped[int] = mapped_column(Integer, default=0)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username: Mapped[str] = mapped_column(String(50), unique=True)
    hashed_password: Mapped[str] = mapped_column(String(128))
    role: Mapped[str] = mapped_column(String(20), default="viewer")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
