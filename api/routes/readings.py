"""Time-series reading endpoints."""

from fastapi import APIRouter, Query

from ..services.influx_service import influx_service

router = APIRouter(prefix="/api/readings", tags=["readings"])


@router.get("/latest")
def all_latest():
    """Get the latest reading for all sensors."""
    return influx_service.query_all_latest()


@router.get("/{sensor_id}")
def get_readings(
    sensor_id: str,
    start: str = Query(default="-1h", description="Start time (Flux duration or ISO)"),
    end: str = Query(default="now()", description="End time"),
    window: str = Query(default="10s", description="Aggregation window"),
):
    """Get time-series data for a sensor."""
    return influx_service.query_range(sensor_id, start, end, window)
