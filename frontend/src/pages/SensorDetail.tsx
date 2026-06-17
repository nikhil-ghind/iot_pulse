import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import client from "../api/client";
import { useLiveData } from "../hooks/useLiveData";
import TimeSeriesChart from "../components/TimeSeriesChart";
import GaugeWidget from "../components/GaugeWidget";
import type { SensorReading } from "../hooks/useSensors";

const rangeOptions = [
  { label: "5m", value: "-5m", window: "5s" },
  { label: "15m", value: "-15m", window: "10s" },
  { label: "1h", value: "-1h", window: "30s" },
  { label: "6h", value: "-6h", window: "2m" },
  { label: "24h", value: "-24h", window: "10m" },
];

const gaugeRanges: Record<string, [number, number]> = {
  temperature: [15, 40],
  pressure: [80, 140],
  vibration: [0, 15],
  flow_rate: [0, 200],
};

const SensorDetail: React.FC = () => {
  const { sensorId } = useParams<{ sensorId: string }>();
  const [range, setRange] = useState(rangeOptions[2]);
  const [sensor, setSensor] = useState<SensorReading | null>(null);

  const { data, loading } = useLiveData(sensorId!, range.value, "now()", range.window);

  useEffect(() => {
    client.get<SensorReading>(`/api/sensors/${sensorId}`).then((r) => setSensor(r.data)).catch(() => {});
  }, [sensorId]);

  const stats = data.length > 0
    ? {
        min: Math.min(...data.filter((d) => d.value !== null).map((d) => d.value!)),
        max: Math.max(...data.filter((d) => d.value !== null).map((d) => d.value!)),
        mean: +(
          data.filter((d) => d.value !== null).reduce((s, d) => s + d.value!, 0) /
          data.filter((d) => d.value !== null).length
        ).toFixed(2),
      }
    : null;

  const [gMin, gMax] = gaugeRanges[sensor?.sensor_type || "temperature"] || [0, 100];

  return (
    <div>
      <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
        &larr; Back to Dashboard
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">{sensorId}</h1>
        {sensor && (
          <span className="text-sm bg-gray-800 px-3 py-1 rounded-lg text-gray-400 uppercase">
            {sensor.sensor_type}
          </span>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {sensor && (
          <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center justify-center">
            <GaugeWidget
              value={sensor.value}
              min={gMin}
              max={gMax}
              unit={sensor.unit}
              label="Current"
            />
          </div>
        )}

        {stats && (
          <div className="bg-gray-800 rounded-xl p-6 flex gap-8 items-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.min}</div>
              <div className="text-xs text-gray-400 uppercase">Min</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.mean}</div>
              <div className="text-xs text-gray-400 uppercase">Mean</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{stats.max}</div>
              <div className="text-xs text-gray-400 uppercase">Max</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Time Series</h2>
          <div className="flex gap-2">
            {rangeOptions.map((r) => (
              <button
                key={r.label}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded text-sm ${
                  range.label === r.label ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="h-[350px] flex items-center justify-center text-gray-500">Loading chart...</div>
        ) : (
          <TimeSeriesChart data={data} />
        )}
      </div>
    </div>
  );
};

export default SensorDetail;
