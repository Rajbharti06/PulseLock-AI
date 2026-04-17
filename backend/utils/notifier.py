import httpx
from backend.utils.config import settings

_ws_connections: list = []


def register_ws(ws):
    _ws_connections.append(ws)


def unregister_ws(ws):
    _ws_connections.discard(ws) if hasattr(_ws_connections, "discard") else None
    if ws in _ws_connections:
        _ws_connections.remove(ws)


async def broadcast_alert(payload: dict):
    import json
    dead = []
    for ws in _ws_connections:
        try:
            await ws.send_text(json.dumps(payload))
        except Exception:
            dead.append(ws)
    for ws in dead:
        if ws in _ws_connections:
            _ws_connections.remove(ws)


async def send_critical_alert(threat_type: str, severity: str, reason: str, action: str):
    payload = {
        "type": "THREAT_ALERT",
        "severity": severity,
        "threat_type": threat_type,
        "reason": reason,
        "action": action,
    }

    await broadcast_alert(payload)

    if settings.ALERT_WEBHOOK_URL:
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                await client.post(settings.ALERT_WEBHOOK_URL, json=payload)
            except Exception:
                pass
