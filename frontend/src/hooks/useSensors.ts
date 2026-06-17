import { useState, useEffect, useCallback } from "react";
import client from "../api/client";

export interface SensorReading {
  sensor_id: string;
  sensor_type: string;
  unit: string;
  value: number;
  timestamp: string;
}

export function useSensors(refreshInterval = 5000) {
  const [sensors, setSensors] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const res = await client.get<SensorReading[]>("/api/readings/latest");
      setSensors(res.data);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, refreshInterval);
    return () => clearInterval(id);
  }, [fetch, refreshInterval]);

  return { sensors, loading, error, refetch: fetch };
}
