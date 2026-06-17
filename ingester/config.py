"""Configuration loaded from environment variables."""

import os

MQTT_BROKER = os.getenv("MQTT_BROKER", "mosquitto")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))

INFLUX_URL = os.getenv("INFLUX_URL", "http://influxdb:8086")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN", "iot-pulse-dev-token")
INFLUX_ORG = os.getenv("INFLUX_ORG", "iot-pulse")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET", "sensor_data")
