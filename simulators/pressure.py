"""Pressure sensor simulator."""

import random

from .base_sensor import BaseSensor


class PressureSensor(BaseSensor):
    """Simulates a pressure sensor around 110 PSI."""

    def __init__(self, sensor_id: str, mqtt_client, interval_seconds: float = 1.0):
        super().__init__(
            sensor_id=sensor_id,
            mqtt_client=mqtt_client,
            topic_prefix="sensors/pressure",
            interval_seconds=interval_seconds,
        )
        self._base = 110.0
        self._current = 110.0

    def generate_reading(self) -> dict:
        self._current += random.uniform(-0.5, 0.5)
        self._current = max(self._base - 10, min(self._base + 10, self._current))
        value = self._current + random.gauss(0, 1.0)
        value = self._maybe_inject_anomaly(value, 15.0)
        return {"value": round(value, 2), "unit": "PSI", "sensor_type": "pressure"}
