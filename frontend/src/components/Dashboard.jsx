import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import apiClient from '../api/client';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/analytics/dashboard');
      setAnalytics(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 text-lg">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!analytics) return null;

  const { summary, ticketsByAsset, timeline } = analytics;

  // Data for pie chart
  const statusData = [
    { name: 'Open', value: summary.openTickets },
    { name: 'Closed', value: summary.closedTickets }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Tickets</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{summary.totalTickets}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <span className="text-2xl">🎫</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Open Tickets</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{summary.openTickets}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Closed Tickets</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{summary.closedTickets}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Assets</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{summary.totalAssets}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Status - Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tickets by Status</h3>
          {summary.totalTickets > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>No tickets data available</p>
            </div>
          )}
        </div>

        {/* Tickets by Asset - Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tickets by Asset</h3>
          {ticketsByAsset.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketsByAsset}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="assetName" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>No tickets by asset data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tickets Timeline (Last 7 Days)</h3>
        {timeline.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="open" stroke="#f59e0b" strokeWidth={2} name="Open" />
              <Line type="monotone" dataKey="closed" stroke="#10b981" strokeWidth={2} name="Closed" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <p>No recent tickets in the last 7 days</p>
          </div>
        )}
      </div>
    </div>
  );
}
