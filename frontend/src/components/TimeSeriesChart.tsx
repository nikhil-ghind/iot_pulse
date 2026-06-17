import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface DataPoint {
  timestamp: string;
  value: number | null;
}

interface Props {
  data: DataPoint[];
  color?: string;
}

const TimeSeriesChart: React.FC<Props> = ({ data, color = "#3b82f6" }) => {
  const formatted = data.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString(),
    value: d.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 12 }} />
        <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
          labelStyle={{ color: "#9ca3af" }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TimeSeriesChart;
