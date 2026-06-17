"""InfluxDB query service for the FastAPI app."""

import os
from datetime import datetime

from influxdb_client import InfluxDBClient

INFLUX_URL = os.getenv("INFLUX_URL", "http://influxdb:8086")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN", "iot-pulse-dev-token")
INFLUX_ORG = os.getenv("INFLUX_ORG", "iot-pulse")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET", "sensor_data")


class InfluxService:
    def __init__(self):
        self.client = InfluxDBClient(
            url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG
        )
        self.query_api = self.client.query_api()
        self.bucket = INFLUX_BUCKET
        self.org = INFLUX_ORG

    def query_all_latest(self) -> list[dict]:
        """Get the latest reading for every sensor."""
        flux = f'''
from(bucket: "{self.bucket}")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "sensor_readings")
  |> filter(fn: (r) => r._field == "value")
  |> group(columns: ["sensor_id", "sensor_type", "unit"])
  |> last()
'''
        tables = self.query_api.query(flux, org=self.org)
        results = []
        for table in tables:
            for record in table.records:
                results.append({
                    "sensor_id": record.values.get("sensor_id"),
                    "sensor_type": record.values.get("sensor_type"),
                    "unit": record.values.get("unit", ""),
                    "value": record.get_value(),
                    "timestamp": record.get_time().isoformat(),
                })
        return results

    def query_latest(self, sensor_id: str) -> dict | None:
        """Get the latest reading for a specific sensor."""
        flux = f'''
from(bucket: "{self.bucket}")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "sensor_readings")
  |> filter(fn: (r) => r._field == "value")
  |> filter(fn: (r) => r.sensor_id == "{sensor_id}")
  |> last()
'''
        tables = self.query_api.query(flux, org=self.org)
        for table in tables:
            for record in table.records:
                return {
                    "sensor_id": record.values.get("sensor_id"),
                    "sensor_type": record.values.get("sensor_type"),
                    "unit": record.values.get("unit", ""),
                    "value": record.get_value(),
                    "timestamp": record.get_time().isoformat(),
                }
        return None

    def query_range(
        self,
        sensor_id: str,
        start: str = "-1h",
        end: str = "now()",
        window: str = "10s",
    ) -> list[dict]:
        """Get aggregated time-series data for a sensor over a range."""
        # If start looks like an ISO timestamp, wrap in time()
        start_expr = f'time(v: "{start}")' if "T" in start else start
        end_expr = f'time(v: "{end}")' if "T" in end else end

        flux = f'''
from(bucket: "{self.bucket}")
  |> range(start: {start_expr}, stop: {end_expr})
  |> filter(fn: (r) => r._measurement == "sensor_readings")
  |> filter(fn: (r) => r._field == "value")
  |> filter(fn: (r) => r.sensor_id == "{sensor_id}")
  |> aggregateWindow(every: {window}, fn: mean, createEmpty: false)
  |> yield(name: "mean")
'''
        tables = self.query_api.query(flux, org=self.org)
        results = []
        for table in tables:
            for record in table.records:
                results.append({
                    "timestamp": record.get_time().isoformat(),
                    "value": round(record.get_value(), 2) if record.get_value() is not None else None,
                })
        return results


# Singleton
influx_service = InfluxService()
