FROM python:3.12-slim

WORKDIR /app

COPY ingester/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ingester/ /app/ingester/

CMD ["python", "-m", "ingester.mqtt_consumer"]
