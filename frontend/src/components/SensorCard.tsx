import React from "react";

interface Props {
  sensorId: string;
  sensorType: string;
  value: number;
  unit: string;
  onClick?: () => void;
}

function statusColor(sensorType: string, value: number): string {
  // Simple thresholds for status coloring
  const thresholds: Record<string, [number, number]> = {
    temperature: [20, 30],
    pressure: [95, 125],
    vibration: [0, 6],
    flow_rate: [80, 160],
  };
  const [low, high] = thresholds[sensorType] || [0, Infinity];
  if (value < low || value > high) return "bg-red-500";
  const warningLow = low + (high - low) * 0.1;
  const warningHigh = high - (high - low) * 0.1;
  if (value < warningLow || value > warningHigh) return "bg-yellow-500";
  return "bg-green-500";
}

const SensorCard: React.FC<Props> = ({ sensorId, sensorType, value, unit, onClick }) => {
  const dot = statusColor(sensorType, value);
  return (
    <div
      onClick={onClick}
      className="bg-gray-800 rounded-xl p-5 cursor-pointer hover:bg-gray-750 transition border border-gray-700 hover:border-gray-500"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400 uppercase tracking-wide">{sensorType}</span>
        <span className={`w-3 h-3 rounded-full ${dot}`} />
      </div>
      <div className="text-3xl font-bold mb-1">
        {value} <span className="text-lg text-gray-400">{unit}</span>
      </div>
      <div className="text-sm text-gray-500">{sensorId}</div>
    </div>
  );
};

export default SensorCard;
