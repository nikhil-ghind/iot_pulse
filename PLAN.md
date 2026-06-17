# IoT Pulse

## Project Overview
High-frequency data ingestion pipeline using MQTT to collect telemetry from simulated industrial sensors. InfluxDB for time-series storage, FastAPI REST API for data access, and a React/TypeScript dashboard for real-time visualization. Full stack containerized with Docker.

## Tech Stack
- **Ingestion:** MQTT (Mosquitto broker), paho-mqtt
- **Storage:** InfluxDB 2.x
- **Backend:** FastAPI, Python 3.11+
- **Frontend:** React 18, TypeScript, Recharts
- **Simulation:** Python sensor simulators
- **Container:** Docker, Docker Compose

## Architecture Overview
```
┌─────────────┐  MQTT   ┌───────────┐  Write  ┌──────────┐
│ Sensor Sims │ ──────► │ MQTT      │ ──────► │ InfluxDB │
│ (Python)    │         │ Broker    │         │ (TSDB)   │
└─────────────┘         └───────────┘         └────┬─────┘
                                                   │ Query
                                            ┌──────┴─────┐
                                            │  FastAPI   │
                                            │  REST API  │
                                            └──────┬─────┘
                                                   │
                                            ┌──────┴─────┐
                                            │  React     │
                                            │  Dashboard │
                                            └────────────┘
```

## Phase 1: MQTT Broker & Sensor Simulators
**Goal:** Set up MQTT broker and Python-based sensor simulators generating realistic telemetry.

### Tasks
1. Project structure:
   ```
   iotSensorDataPipelineDashboard/
   ├── simulators/
   │   ├── base_sensor.py       # Abstract sensor
   │   ├── temperature.py       # Temperature sensor sim
   │   ├── pressure.py          # Pressure sensor sim
   │   ├── vibration.py         # Vibration sensor sim
   │   ├── flow_rate.py         # Flow rate sensor sim
   │   └── run_simulators.py    # Start all sensors
   ├── ingester/
   │   ├── mqtt_consumer.py     # MQTT → InfluxDB bridge
   │   └── config.py
   ├── api/
   │   ├── main.py
   │   ├── routes/
   │   │   ├── sensors.py
   │   │   ├── readings.py
   │   │   └── alerts.py
   │   └── services/
   │       └── influx_service.py
   ├── frontend/
   │   └── ...
   ├── docker-compose.yml
   └── mosquitto/
       └── mosquitto.conf
   ```
2. `simulators/base_sensor.py`:
   - `class BaseSensor(ABC)`:
     - `__init__(sensor_id, mqtt_client, topic, interval_ms)`
     - `@abstractmethod generate_reading() -> dict` — returns `{"value": float, "unit": str, "timestamp": ISO8601}`
     - `run()` — loop: generate → publish to MQTT topic → sleep
     - Includes: gradual drift, random noise, occasional anomaly spikes
3. `simulators/temperature.py`:
   - `class TemperatureSensor(BaseSensor)`: base temp 25°C, ±2°C random walk, Gaussian noise σ=0.5°C, occasional spike to 45°C
   - Topic: `sensors/factory1/temperature/{sensor_id}`
   - Publish rate: 1Hz
4. Similar implementations for pressure (100-120 PSI), vibration (0-10 mm/s), flow_rate (50-200 L/min).
5. `simulators/run_simulators.py` — starts 4 temperature, 2 pressure, 2 vibration, 2 flow sensors in threads.
6. Docker Compose: Mosquitto broker on port 1883.

## Phase 2: MQTT-to-InfluxDB Ingester
**Goal:** Bridge MQTT messages to InfluxDB time-series storage.

### Tasks
1. `ingester/mqtt_consumer.py`:
   - `class MQTTIngester`:
     - Subscribes to `sensors/#` wildcard topic
     - `on_message` callback: parse JSON payload, extract sensor_id and type from topic, write to InfluxDB
     - Batch writes: accumulate points for 1 second, then flush batch
     - Error handling: log failed writes, retry with backoff
2. InfluxDB setup:
   - Bucket: `sensor_data`, retention: 30 days
   - Measurement: `sensor_readings`
   - Tags: `sensor_id`, `sensor_type`, `location`
   - Fields: `value` (float)
3. `ingester/config.py` — settings: MQTT broker URL, InfluxDB URL/token/org/bucket, batch size, flush interval.
4. Docker Compose: add InfluxDB service, expose 8086.
5. Test: start simulators → start ingester → query InfluxDB → verify data flowing.

## Phase 3: FastAPI REST API
**Goal:** Build API endpoints for querying sensor data and managing alerts.

### Tasks
1. `api/services/influx_service.py`:
   - `class InfluxService`:
     - `query_latest(sensor_id) -> Reading` — last reading for a sensor
     - `query_range(sensor_id, start, end, aggregation_window) -> list[Reading]` — time range with optional downsampling (mean/max/min per window)
     - `query_all_latest() -> dict[str, Reading]` — latest reading per sensor
     - `query_anomalies(threshold_zscore) -> list[Reading]` — readings > N std devs from mean
2. `api/routes/sensors.py`:
   - `GET /api/sensors` — list all known sensors with metadata
   - `GET /api/sensors/{sensor_id}` — sensor details + latest reading
3. `api/routes/readings.py`:
   - `GET /api/readings/{sensor_id}?start=&end=&window=` — time-series data with aggregation
   - `GET /api/readings/latest` — all sensors' latest values
4. `api/routes/alerts.py`:
   - `POST /api/alerts` — create alert rule: `{sensor_id, condition: "above"|"below", threshold, severity}`
   - `GET /api/alerts` — list alert rules
   - `GET /api/alerts/active` — currently firing alerts (readings violating thresholds)
5. WebSocket endpoint `WS /api/ws/live` — streams real-time readings as they arrive (subscribe to MQTT internally).

## Phase 4: React Dashboard
**Goal:** Build real-time visualization dashboard with charts and alerts.

### Tasks
1. Frontend structure:
   ```
   frontend/src/
   ├── App.tsx
   ├── pages/
   │   ├── Dashboard.tsx       # Overview: all sensors, summary stats
   │   ├── SensorDetail.tsx    # Single sensor deep-dive
   │   └── Alerts.tsx          # Alert management
   ├── components/
   │   ├── SensorCard.tsx      # Live value + sparkline
   │   ├── TimeSeriesChart.tsx # Recharts line chart with zoom
   │   ├── GaugeWidget.tsx     # Radial gauge for current value
   │   ├── AlertBanner.tsx     # Active alert notification
   │   └── DateRangePicker.tsx
   ├── hooks/
   │   ├── useSensors.ts       # REST API polling
   │   ├── useLiveData.ts      # WebSocket hook
   │   └── useAlerts.ts
   └── api/client.ts
   ```
2. `Dashboard.tsx`:
   - Grid of SensorCards showing live values (WebSocket-updated)
   - Each card: sensor name, current value with unit, trend sparkline (last 5 min), status indicator (normal/warning/critical)
   - Summary bar: total sensors, active alerts count, avg uptime
3. `SensorDetail.tsx`:
   - Full-width time-series chart (Recharts LineChart) with date range selector
   - Aggregation controls: raw, 1min avg, 5min avg, 1hr avg
   - Statistics panel: min, max, mean, std dev for selected range
   - Alert threshold lines overlaid on chart
4. `Alerts.tsx`:
   - Create alert rule form: select sensor, condition, threshold, severity
   - Active alerts table with timestamp, sensor, value, severity
   - Alert history log

## Phase 5: Docker Compose & Production Hardening
**Goal:** Full-stack containerization and operational readiness.

### Tasks
1. `docker-compose.yml`: mosquitto, influxdb, ingester, api, frontend (nginx), sensor-simulators
2. Health checks on all services.
3. InfluxDB backup/restore scripts.
4. Add Grafana as alternative dashboard with pre-built InfluxDB datasource.
5. Load test: 100 sensors at 10Hz → verify ingester keeps up, API responsive.
6. Environment configs: `.env.dev`, `.env.prod` with different retention policies and batch sizes.
