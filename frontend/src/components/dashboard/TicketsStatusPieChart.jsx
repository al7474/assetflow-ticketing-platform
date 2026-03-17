// TicketsStatusPieChart.jsx
// Pie chart for tickets by status
import React from 'react';
import { PieChart, Pie, ResponsiveContainer, Tooltip, Cell } from 'recharts';

export function TicketsStatusPieChart({ data, totalTickets }) {
  if (totalTickets === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-200">
        <p>No tickets data available</p>
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : '#10b981'} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgb(31, 41, 55)', 
            border: '1px solid rgb(75, 85, 99)',
            borderRadius: '0.5rem',
            color: '#fff'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
