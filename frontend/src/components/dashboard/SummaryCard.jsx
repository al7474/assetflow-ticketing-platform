// SummaryCard.jsx
// Reusable summary card for dashboard metrics
import React from 'react';

export function SummaryCard({ label, value, icon, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/50',
    orange: 'bg-orange-100 dark:bg-orange-900/50',
    green: 'bg-green-100 dark:bg-green-900/50',
    purple: 'bg-purple-100 dark:bg-purple-900/50',
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-200 text-sm font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color === 'indigo' ? 'text-gray-800 dark:text-white' : color === 'orange' ? 'text-orange-600 dark:text-orange-400' : color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-purple-600 dark:text-purple-400'}`}>{value}</p>
        </div>
        <div className={`${colorMap[color]} p-3 rounded-lg`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}
