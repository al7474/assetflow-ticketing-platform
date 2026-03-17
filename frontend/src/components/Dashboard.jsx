import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import { TicketsStatusPieChart } from './dashboard/TicketsStatusPieChart';
import { TicketsByAssetBarChart } from './dashboard/TicketsByAssetBarChart';
import { TicketsTimelineLineChart } from './dashboard/TicketsTimelineLineChart';
import { SummaryCard } from './dashboard/SummaryCard';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function Dashboard() {
  const { analytics, loading, error } = useDashboardAnalytics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 dark:text-gray-100 text-lg">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600 dark:text-red-300">{error}</p>
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
        <SummaryCard label="Total Tickets" value={summary.totalTickets} icon="🎫" color="indigo" />
        <SummaryCard label="Open Tickets" value={summary.openTickets} icon="⚠️" color="orange" />
        <SummaryCard label="Closed Tickets" value={summary.closedTickets} icon="✅" color="green" />
        <SummaryCard label="Total Assets" value={summary.totalAssets} icon="📦" color="purple" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Status - Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tickets by Status</h3>
          <TicketsStatusPieChart data={statusData} totalTickets={summary.totalTickets} />
        </div>

        {/* Tickets by Asset - Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tickets by Asset</h3>
          <TicketsByAssetBarChart data={ticketsByAsset} />
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tickets Timeline (Last 7 Days)</h3>
        <TicketsTimelineLineChart data={timeline} />
      </div>
    </div>
  );
}
