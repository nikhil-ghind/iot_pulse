import { useState, useEffect, useCallback } from "react";
import client from "../api/client";

export interface DataPoint {
  timestamp: string;
  value: number | null;
}

export function useLiveData(
  sensorId: string,
  start = "-1h",
  end = "now()",
  window = "10s",
  refreshInterval = 5000
) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const res = await client.get<DataPoint[]>(
        `/api/readings/${sensorId}`,
        { params: { start, end, window } }
      );
      setData(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [sensorId, start, end, window]);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, refreshInterval);
    return () => clearInterval(id);
  }, [fetch, refreshInterval]);

  return { data, loading };
}
