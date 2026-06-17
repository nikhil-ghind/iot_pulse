import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SensorDetail from "./pages/SensorDetail";
import Alerts from "./pages/Alerts";

const navItems = [
  { path: "/", label: "Dashboard" },
  { path: "/alerts", label: "Alerts" },
];

const App: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-6">
        <span className="text-xl font-bold text-blue-400 mr-4">IoT Pulse</span>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`text-sm ${
              location.pathname === item.path
                ? "text-white font-semibold"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sensor/:sensorId" element={<SensorDetail />} />
          <Route path="/alerts" element={<Alerts />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
