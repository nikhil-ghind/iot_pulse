import React from "react";
import { useNavigate } from "react-router-dom";
import { useSensors } from "../hooks/useSensors";
import { useAlerts } from "../hooks/useAlerts";
import SensorCard from "../components/SensorCard";
import AlertBanner from "../components/AlertBanner";

const Dashboard: React.FC = () => {
  const { sensors, loading } = useSensors();
  const { active } = useAlerts();
  const navigate = useNavigate();

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading sensors...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-4 text-sm">
          <span className="bg-gray-800 px-3 py-1 rounded-lg">
            Sensors: <span className="font-bold text-white">{sensors.length}</span>
          </span>
          <span className={`px-3 py-1 rounded-lg ${active.length > 0 ? "bg-red-900/50 text-red-300" : "bg-gray-800"}`}>
            Active Alerts: <span className="font-bold">{active.length}</span>
          </span>
        </div>
      </div>

      <AlertBanner alerts={active} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sensors.map((s) => (
          <SensorCard
            key={s.sensor_id}
            sensorId={s.sensor_id}
            sensorType={s.sensor_type}
            value={s.value}
            unit={s.unit}
            onClick={() => navigate(`/sensor/${s.sensor_id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
