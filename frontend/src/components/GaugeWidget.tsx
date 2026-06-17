import React from "react";

interface Props {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
}

const GaugeWidget: React.FC<Props> = ({ value, min, max, unit, label }) => {
  const clamped = Math.max(min, Math.min(max, value));
  const pct = (clamped - min) / (max - min);
  const angle = -90 + pct * 180; // -90 to 90 degrees

  const r = 80;
  const cx = 100;
  const cy = 100;

  // Arc path from -90 to +90 degrees (bottom half circle, flipped to top)
  const startX = cx + r * Math.cos((-90 * Math.PI) / 180);
  const startY = cy + r * Math.sin((-90 * Math.PI) / 180);
  const endAngleRad = (angle * Math.PI) / 180;
  const endX = cx + r * Math.cos(endAngleRad);
  const endY = cy + r * Math.sin(endAngleRad);
  const largeArc = pct > 0.5 ? 1 : 0;

  // Background arc
  const bgEndX = cx + r * Math.cos((90 * Math.PI) / 180);
  const bgEndY = cy + r * Math.sin((90 * Math.PI) / 180);

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="120" viewBox="0 0 200 120">
        {/* Background arc */}
        <path
          d={`M ${startX} ${startY} A ${r} ${r} 0 1 1 ${bgEndX} ${bgEndY}`}
          fill="none"
          stroke="#374151"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Value arc */}
        {pct > 0 && (
          <path
            d={`M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="12"
            strokeLinecap="round"
          />
        )}
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#f3f4f6" fontSize="24" fontWeight="bold">
          {value}
        </text>
        <text x={cx} y={cy + 15} textAnchor="middle" fill="#9ca3af" fontSize="12">
          {unit}
        </text>
      </svg>
      <span className="text-sm text-gray-400 mt-1">{label}</span>
    </div>
  );
};

export default GaugeWidget;
