import React, { useState } from "react";
import { useAlerts } from "../hooks/useAlerts";

const Alerts: React.FC = () => {
  const { rules, active, createAlert, deleteAlert } = useAlerts();
  const [form, setForm] = useState({
    name: "",
    sensor_id: "",
    condition: "above" as "above" | "below",
    threshold: 0,
    severity: "warning" as "info" | "warning" | "critical",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAlert(form);
    setForm({ name: "", sensor_id: "", condition: "above", threshold: 0, severity: "warning" });
  };

  const severityColor: Record<string, string> = {
    critical: "text-red-400",
    warning: "text-yellow-400",
    info: "text-blue-400",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Alert Rules</h1>

      {/* Create form */}
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 mb-8 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Name</label>
          <input
            className="w-full bg-gray-700 rounded px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="High temp alert"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Sensor ID</label>
          <input
            className="w-full bg-gray-700 rounded px-3 py-2 text-sm"
            value={form.sensor_id}
            onChange={(e) => setForm({ ...form, sensor_id: e.target.value })}
            required
            placeholder="temp-01"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Condition</label>
          <select
            className="w-full bg-gray-700 rounded px-3 py-2 text-sm"
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value as any })}
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Threshold</label>
          <input
            type="number"
            step="any"
            className="w-full bg-gray-700 rounded px-3 py-2 text-sm"
            value={form.threshold}
            onChange={(e) => setForm({ ...form, threshold: parseFloat(e.target.value) })}
            required
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Severity</label>
          <select
            className="w-full bg-gray-700 rounded px-3 py-2 text-sm"
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value as any })}
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 rounded px-4 py-2 text-sm font-semibold">
          Create Rule
        </button>
      </form>

      {/* Active alerts */}
      {active.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-red-400">Active Alerts ({active.length})</h2>
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="text-left px-4 py-3">Sensor</th>
                  <th className="text-left px-4 py-3">Condition</th>
                  <th className="text-left px-4 py-3">Threshold</th>
                  <th className="text-left px-4 py-3">Current</th>
                  <th className="text-left px-4 py-3">Severity</th>
                </tr>
              </thead>
              <tbody>
                {active.map((a) => (
                  <tr key={a.rule_id} className="border-b border-gray-700/50">
                    <td className="px-4 py-3">{a.sensor_id}</td>
                    <td className="px-4 py-3">{a.condition}</td>
                    <td className="px-4 py-3">{a.threshold}</td>
                    <td className="px-4 py-3 font-bold">{a.current_value}</td>
                    <td className={`px-4 py-3 font-semibold uppercase ${severityColor[a.severity] || ""}`}>
                      {a.severity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All rules */}
      <h2 className="text-lg font-semibold mb-3">All Rules ({rules.length})</h2>
      {rules.length === 0 ? (
        <p className="text-gray-500">No alert rules configured.</p>
      ) : (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Sensor</th>
                <th className="text-left px-4 py-3">Condition</th>
                <th className="text-left px-4 py-3">Threshold</th>
                <th className="text-left px-4 py-3">Severity</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-b border-gray-700/50">
                  <td className="px-4 py-3">{r.name || "-"}</td>
                  <td className="px-4 py-3">{r.sensor_id}</td>
                  <td className="px-4 py-3">{r.condition}</td>
                  <td className="px-4 py-3">{r.threshold}</td>
                  <td className={`px-4 py-3 font-semibold uppercase ${severityColor[r.severity] || ""}`}>
                    {r.severity}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteAlert(r.id)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Alerts;
