// TicketsByAssetBarChart.jsx
// Bar chart for tickets by asset
import React from 'react';
import { BarChart, Bar, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export function TicketsByAssetBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-200">
        <p>No tickets by asset data available</p>
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
        <XAxis 
          dataKey="assetName" 
          angle={-45} 
          textAnchor="end" 
          height={100}
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
        <Bar dataKey="count" fill="#6366f1" />
      </BarChart>
    </ResponsiveContainer>
  );
}
