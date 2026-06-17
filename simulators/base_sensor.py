"""Abstract base class for all sensor simulators."""

import json
import random
import time
from abc import ABC, abstractmethod
from datetime import datetime, timezone

import paho.mqtt.client as mqtt


class BaseSensor(ABC):
    """Base sensor that publishes readings to an MQTT topic at a fixed interval."""

    def __init__(
        self,
        sensor_id: str,
        mqtt_client: mqtt.Client,
        topic_prefix: str,
        interval_seconds: float = 1.0,
        anomaly_probability: float = 0.02,
    ):
        self.sensor_id = sensor_id
        self.mqtt_client = mqtt_client
        self.topic = f"{topic_prefix}/{sensor_id}"
        self.interval_seconds = interval_seconds
        self.anomaly_probability = anomaly_probability
        self._running = False

    @abstractmethod
    def generate_reading(self) -> dict:
        """Return a dict with at least a 'value' key and a 'unit' key."""
        ...

    def _maybe_inject_anomaly(self, value: float, magnitude: float) -> float:
        """Occasionally spike the value to simulate anomalies."""
        if random.random() < self.anomaly_probability:
            direction = random.choice([-1, 1])
            value += direction * magnitude * random.uniform(2.0, 5.0)
        return value

    def run(self):
        """Publish readings in a loop until stopped."""
        self._running = True
        while self._running:
            reading = self.generate_reading()
            payload = {
                "sensor_id": self.sensor_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                **reading,
            }
            self.mqtt_client.publish(self.topic, json.dumps(payload), qos=1)
            time.sleep(self.interval_seconds)

    def stop(self):
        self._running = False
