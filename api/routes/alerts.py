"""Alert rule CRUD and evaluation endpoints."""

import uuid
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..services.influx_service import influx_service

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


class AlertRule(BaseModel):
    sensor_id: str
    condition: Literal["above", "below"]
    threshold: float
    severity: Literal["info", "warning", "critical"]
    name: str = ""


class StoredAlert(AlertRule):
    id: str


# In-memory store
_alert_rules: dict[str, StoredAlert] = {}


@router.post("", status_code=201)
def create_alert(rule: AlertRule):
    """Create a new alert rule."""
    alert_id = str(uuid.uuid4())[:8]
    stored = StoredAlert(id=alert_id, **rule.model_dump())
    _alert_rules[alert_id] = stored
    return stored


@router.get("")
def list_alerts():
    """List all alert rules."""
    return list(_alert_rules.values())


@router.delete("/{alert_id}")
def delete_alert(alert_id: str):
    """Delete an alert rule."""
    if alert_id not in _alert_rules:
        raise HTTPException(status_code=404, detail="Alert not found")
    del _alert_rules[alert_id]
    return {"deleted": alert_id}


@router.get("/active")
def active_alerts():
    """Evaluate all rules against current readings and return triggered alerts."""
    if not _alert_rules:
        return []

    latest = influx_service.query_all_latest()
    latest_map = {r["sensor_id"]: r for r in latest}

    triggered = []
    for rule in _alert_rules.values():
        reading = latest_map.get(rule.sensor_id)
        if reading is None:
            continue
        value = reading["value"]
        fired = False
        if rule.condition == "above" and value > rule.threshold:
            fired = True
        elif rule.condition == "below" and value < rule.threshold:
            fired = True
        if fired:
            triggered.append({
                "rule_id": rule.id,
                "rule_name": rule.name,
                "sensor_id": rule.sensor_id,
                "condition": rule.condition,
                "threshold": rule.threshold,
                "current_value": value,
                "severity": rule.severity,
            })
    return triggered
