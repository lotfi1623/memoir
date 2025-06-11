'use client'

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";

export default function Chart() {
  // Exemple de données (remplace par tes vraies données)
  const today = new Date();
  const data = Array.from({ length: 12 }, (_, i) => ({
    name: new Date(0, i).toLocaleString('default', { month: 'short' }),
    heures: Math.floor(Math.random() * 20) + 5,
  }));

  return (
    <div className="dark:border-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-5 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-gray-900 mb-4">Statistiques mensuelles</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="heures" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
