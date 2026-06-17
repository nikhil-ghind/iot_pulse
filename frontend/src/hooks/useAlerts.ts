import { useState, useEffect, useCallback } from "react";
import client from "../api/client";

export interface AlertRule {
  id: string;
  sensor_id: string;
  condition: "above" | "below";
  threshold: number;
  severity: "info" | "warning" | "critical";
  name: string;
}

export interface ActiveAlert {
  rule_id: string;
  rule_name: string;
  sensor_id: string;
  condition: string;
  threshold: number;
  current_value: number;
  severity: string;
}

export function useAlerts(refreshInterval = 5000) {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [active, setActive] = useState<ActiveAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [rulesRes, activeRes] = await Promise.all([
        client.get<AlertRule[]>("/api/alerts"),
        client.get<ActiveAlert[]>("/api/alerts/active"),
      ]);
      setRules(rulesRes.data);
      setActive(activeRes.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, refreshInterval);
    return () => clearInterval(id);
  }, [fetchAll, refreshInterval]);

  const createAlert = useCallback(
    async (rule: Omit<AlertRule, "id">) => {
      await client.post("/api/alerts", rule);
      await fetchAll();
    },
    [fetchAll]
  );

  const deleteAlert = useCallback(
    async (alertId: string) => {
      await client.delete(`/api/alerts/${alertId}`);
      await fetchAll();
    },
    [fetchAll]
  );

  return { rules, active, loading, createAlert, deleteAlert, refetch: fetchAll };
}
