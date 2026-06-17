"""Sensor list and detail endpoints."""

from fastapi import APIRouter, HTTPException

from ..services.influx_service import influx_service

router = APIRouter(prefix="/api/sensors", tags=["sensors"])


@router.get("")
def list_sensors():
    """List all known sensors with their latest reading."""
    readings = influx_service.query_all_latest()
    # Deduplicate by sensor_id (latest should already be one per sensor)
    seen = {}
    for r in readings:
        seen[r["sensor_id"]] = r
    return list(seen.values())


@router.get("/{sensor_id}")
def get_sensor(sensor_id: str):
    """Get details and latest reading for a specific sensor."""
    reading = influx_service.query_latest(sensor_id)
    if reading is None:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return reading
