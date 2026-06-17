"""Temperature sensor simulator."""

import random

from .base_sensor import BaseSensor


class TemperatureSensor(BaseSensor):
    """Simulates a temperature sensor around 25 deg C with random walk and Gaussian noise."""

    def __init__(self, sensor_id: str, mqtt_client, interval_seconds: float = 1.0):
        super().__init__(
            sensor_id=sensor_id,
            mqtt_client=mqtt_client,
            topic_prefix="sensors/temperature",
            interval_seconds=interval_seconds,
        )
        self._base = 25.0
        self._current = 25.0

    def generate_reading(self) -> dict:
        # Random walk step
        self._current += random.uniform(-0.1, 0.1)
        # Clamp to base +/- 2
        self._current = max(self._base - 2, min(self._base + 2, self._current))
        # Gaussian noise
        value = self._current + random.gauss(0, 0.5)
        value = self._maybe_inject_anomaly(value, 3.0)
        return {"value": round(value, 2), "unit": "°C", "sensor_type": "temperature"}
