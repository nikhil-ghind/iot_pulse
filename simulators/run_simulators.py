"""Launch all sensor simulators in threads."""

import os
import signal
import sys
import threading
import time

import paho.mqtt.client as mqtt

from .temperature import TemperatureSensor
from .pressure import PressureSensor
from .vibration import VibrationSensor
from .flow_rate import FlowRateSensor

MQTT_BROKER = os.getenv("MQTT_BROKER", "mosquitto")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))


def main():
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="simulator-main")

    print(f"Connecting to MQTT broker at {MQTT_BROKER}:{MQTT_PORT} ...")
    client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
    client.loop_start()

    sensors = []
    # 4 temperature sensors
    for i in range(1, 5):
        sensors.append(TemperatureSensor(f"temp-{i:02d}", client))
    # 2 pressure sensors
    for i in range(1, 3):
        sensors.append(PressureSensor(f"press-{i:02d}", client))
    # 2 vibration sensors
    for i in range(1, 3):
        sensors.append(VibrationSensor(f"vib-{i:02d}", client))
    # 2 flow rate sensors
    for i in range(1, 3):
        sensors.append(FlowRateSensor(f"flow-{i:02d}", client))

    threads = []
    for sensor in sensors:
        t = threading.Thread(target=sensor.run, daemon=True)
        t.start()
        threads.append(t)

    print(f"Started {len(sensors)} sensor simulators. Press Ctrl+C to stop.")

    def shutdown(sig, frame):
        print("\nShutting down simulators...")
        for s in sensors:
            s.stop()
        client.loop_stop()
        client.disconnect()
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    while True:
        time.sleep(1)


if __name__ == "__main__":
    main()
