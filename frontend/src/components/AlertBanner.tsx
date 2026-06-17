import React from "react";
import { ActiveAlert } from "../hooks/useAlerts";

interface Props {
  alerts: ActiveAlert[];
}

const severityStyles: Record<string, string> = {
  critical: "bg-red-900/50 border-red-500 text-red-200",
  warning: "bg-yellow-900/50 border-yellow-500 text-yellow-200",
  info: "bg-blue-900/50 border-blue-500 text-blue-200",
};

const AlertBanner: React.FC<Props> = ({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {alerts.map((a) => (
        <div
          key={a.rule_id}
          className={`border rounded-lg px-4 py-3 ${severityStyles[a.severity] || severityStyles.info}`}
        >
          <span className="font-semibold uppercase text-xs mr-2">{a.severity}</span>
          {a.rule_name || a.sensor_id}: {a.current_value} is {a.condition} threshold {a.threshold}
        </div>
      ))}
    </div>
  );
};

export default AlertBanner;
