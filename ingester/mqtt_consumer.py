"""MQTT to InfluxDB bridge. Subscribes to sensors/# and batch-writes to InfluxDB."""

import json
import threading
import time

import paho.mqtt.client as mqtt
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

from .config import (
    MQTT_BROKER,
    MQTT_PORT,
    INFLUX_URL,
    INFLUX_TOKEN,
    INFLUX_ORG,
    INFLUX_BUCKET,
)


class MQTTIngester:
    def __init__(self):
        # InfluxDB
        self.influx_client = InfluxDBClient(
            url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG
        )
        self.write_api = self.influx_client.write_api(write_options=SYNCHRONOUS)

        # Batch buffer
        self._buffer: list[Point] = []
        self._lock = threading.Lock()

        # MQTT
        self.mqtt_client = mqtt.Client(
            mqtt.CallbackAPIVersion.VERSION2, client_id="ingester"
        )
        self.mqtt_client.on_connect = self._on_connect
        self.mqtt_client.on_message = self._on_message

    def _on_connect(self, client, userdata, flags, rc, properties=None):
        print(f"Connected to MQTT broker (rc={rc}). Subscribing to sensors/#")
        client.subscribe("sensors/#", qos=1)

    def _on_message(self, client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode())
        except (json.JSONDecodeError, UnicodeDecodeError):
            return

        # Parse topic: sensors/<sensor_type>/<sensor_id>
        parts = msg.topic.split("/")
        if len(parts) < 3:
            return
        sensor_type = parts[1]
        sensor_id = parts[2]

        point = (
            Point("sensor_readings")
            .tag("sensor_id", sensor_id)
            .tag("sensor_type", sensor_type)
            .tag("unit", payload.get("unit", ""))
            .field("value", float(payload["value"]))
            .time(payload.get("timestamp"), WritePrecision.S)
        )

        with self._lock:
            self._buffer.append(point)

    def _flush_loop(self):
        """Flush buffered points every second."""
        while True:
            time.sleep(1.0)
            with self._lock:
                if not self._buffer:
                    continue
                batch = list(self._buffer)
                self._buffer.clear()
            try:
                self.write_api.write(bucket=INFLUX_BUCKET, record=batch)
            except Exception as e:
                print(f"InfluxDB write error: {e}")

    def run(self):
        flush_thread = threading.Thread(target=self._flush_loop, daemon=True)
        flush_thread.start()

        print(f"Connecting to MQTT at {MQTT_BROKER}:{MQTT_PORT} ...")
        self.mqtt_client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
        self.mqtt_client.loop_forever()


def main():
    ingester = MQTTIngester()
    ingester.run()


if __name__ == "__main__":
    main()
