"""Vibration sensor simulator."""

import random

from .base_sensor import BaseSensor


class VibrationSensor(BaseSensor):
    """Simulates a vibration sensor around 3 mm/s."""

    def __init__(self, sensor_id: str, mqtt_client, interval_seconds: float = 1.0):
        super().__init__(
            sensor_id=sensor_id,
            mqtt_client=mqtt_client,
            topic_prefix="sensors/vibration",
            interval_seconds=interval_seconds,
        )
        self._base = 3.0
        self._current = 3.0

    def generate_reading(self) -> dict:
        self._current += random.uniform(-0.1, 0.1)
        self._current = max(self._base - 2, min(self._base + 2, self._current))
        value = self._current + random.gauss(0, 0.3)
        value = max(0, value)
        value = self._maybe_inject_anomaly(value, 4.0)
        return {"value": round(value, 2), "unit": "mm/s", "sensor_type": "vibration"}
