from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from backend.models.database import AsyncSessionLocal
from backend.monitoring.anomaly_detector import detect_anomalies
from backend.monitoring.health_check import run_health_check
from backend.intelligence.self_learning import run_learning_cycle
from backend.intelligence.report_generator import generate_monthly_report
from backend.utils.notifier import send_critical_alert

scheduler = AsyncIOScheduler()


async def _anomaly_job():
    async with AsyncSessionLocal() as db:
        result = await detect_anomalies(db)
        if result["status"] in ("warning", "critical"):
            await send_critical_alert(
                threat_type="anomaly_detected",
                severity=result["status"],
                reason=" | ".join(result["details"]),
                action="ALERT",
            )


async def _health_job():
    async with AsyncSessionLocal() as db:
        result = await run_health_check(db)
        if result["overall"] in ("degraded", "critical"):
            await send_critical_alert(
                threat_type="system_health",
                severity=result["overall"],
                reason=" | ".join(result["issues"]),
                action="ALERT",
            )


async def _daily_learning_job():
    async with AsyncSessionLocal() as db:
        await run_learning_cycle(db)


async def _monthly_report_job():
    async with AsyncSessionLocal() as db:
        await generate_monthly_report(db)


def start_scheduler():
    scheduler.add_job(_anomaly_job, IntervalTrigger(minutes=15), id="anomaly_check", replace_existing=True)
    scheduler.add_job(_health_job, IntervalTrigger(hours=1), id="health_check", replace_existing=True)
    scheduler.add_job(_daily_learning_job, CronTrigger(hour=0, minute=0), id="daily_learning", replace_existing=True)
    scheduler.add_job(_monthly_report_job, CronTrigger(day=1, hour=2, minute=0), id="monthly_report", replace_existing=True)
    scheduler.start()


def stop_scheduler():
    scheduler.shutdown()
