// TicketsTimelineLineChart.jsx
// Line chart for tickets timeline
import React from 'react';
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export function TicketsTimelineLineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-200">
        <p>No recent tickets in the last 7 days</p>
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
        <XAxis 
          dataKey="date"
          stroke="#9ca3af"
          tick={{ fill: '#9ca3af' }}
        />
        <YAxis 
          stroke="#9ca3af"
          tick={{ fill: '#9ca3af' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgb(31, 41, 55)', 
            border: '1px solid rgb(75, 85, 99)',
            borderRadius: '0.5rem',
            color: '#fff'
          }}
        />
        <Legend wrapperStyle={{ color: '#9ca3af' }} />
        <Line type="monotone" dataKey="open" stroke="#f59e0b" strokeWidth={2} name="Open" />
        <Line type="monotone" dataKey="closed" stroke="#10b981" strokeWidth={2} name="Closed" />
      </LineChart>
    </ResponsiveContainer>
  );
}
