"""Flow rate sensor simulator."""

import random

from .base_sensor import BaseSensor


class FlowRateSensor(BaseSensor):
    """Simulates a flow rate sensor around 120 L/min."""

    def __init__(self, sensor_id: str, mqtt_client, interval_seconds: float = 1.0):
        super().__init__(
            sensor_id=sensor_id,
            mqtt_client=mqtt_client,
            topic_prefix="sensors/flow_rate",
            interval_seconds=interval_seconds,
        )
        self._base = 120.0
        self._current = 120.0

    def generate_reading(self) -> dict:
        self._current += random.uniform(-1.0, 1.0)
        self._current = max(self._base - 30, min(self._base + 30, self._current))
        value = self._current + random.gauss(0, 2.0)
        value = max(0, value)
        value = self._maybe_inject_anomaly(value, 40.0)
        return {"value": round(value, 2), "unit": "L/min", "sensor_type": "flow_rate"}
