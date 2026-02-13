import { useState, useEffect } from 'react';
import apiClient from '../api/client';

function BillingPage() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await apiClient.get('/subscription/status');

      setSubscription(response.data);
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setError(err.response?.data?.error || 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.post(
        '/subscription/portal',
        {}
      );

      window.location.href = response.data.url;
    } catch (err) {
      console.error('Portal error:', err);
      setError(err.response?.data?.error || 'Failed to open billing portal');
      setPortalLoading(false);
    }
  };

  const getUsagePercentage = (current, max) => {
    if (max === -1) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 70) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-100">Loading subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Demo Mode Banner */}
      <div className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white rounded-lg shadow-lg p-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">🚀 Demo Mode - Instant upgrades & downgrades available</span>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Subscription</h1>
        <p className="text-gray-600 dark:text-gray-100 mt-2">Manage your subscription and view usage</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{subscription.plan.name} Plan</h2>
            <p className="text-gray-600 dark:text-gray-100 mt-1">
              Status: <span className="font-semibold capitalize">{subscription.status}</span>
            </p>
            {subscription.currentPeriodEnd && (
              <p className="text-gray-600 dark:text-gray-100 mt-1">
                Renews on: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${(subscription.plan.price / 100).toFixed(0)}
            </p>
            {subscription.plan.price > 0 && (
              <p className="text-gray-600 dark:text-gray-200">per month</p>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <a
            href="/pricing"
            className="flex-1 bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-center"
          >
            {subscription.tier === 'FREE' ? '⬆️ Upgrade Plan' : subscription.tier === 'ENTERPRISE' ? '📊 View All Plans' : '⬆️ Upgrade or ⬇️ Downgrade'}
          </a>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Current Usage</h3>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-700 dark:text-gray-100 font-medium">Assets</span>
            <span className="text-gray-600 dark:text-gray-200">
              {subscription.usage.assets} / {subscription.plan.limits.maxAssets === -1 ? '∞' : subscription.plan.limits.maxAssets}
            </span>
          </div>
          {subscription.plan.limits.maxAssets !== -1 && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${getUsageColor(
                  getUsagePercentage(subscription.usage.assets, subscription.plan.limits.maxAssets)
                )}`}
                style={{
                  width: `${getUsagePercentage(subscription.usage.assets, subscription.plan.limits.maxAssets)}%`
                }}
              ></div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-700 dark:text-gray-100 font-medium">Tickets</span>
            <span className="text-gray-600 dark:text-gray-200">
              {subscription.usage.tickets} / {subscription.plan.limits.maxTickets === -1 ? '∞' : subscription.plan.limits.maxTickets}
            </span>
          </div>
          {subscription.plan.limits.maxTickets !== -1 && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${getUsageColor(
                  getUsagePercentage(subscription.usage.tickets, subscription.plan.limits.maxTickets)
                )}`}
                style={{
                  width: `${getUsagePercentage(subscription.usage.tickets, subscription.plan.limits.maxTickets)}%`
                }}
              ></div>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-700 dark:text-gray-100 font-medium">Users</span>
            <span className="text-gray-600 dark:text-gray-200">
              {subscription.usage.users} / {subscription.plan.limits.maxUsers === -1 ? '∞' : subscription.plan.limits.maxUsers}
            </span>
          </div>
          {subscription.plan.limits.maxUsers !== -1 && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${getUsageColor(
                  getUsagePercentage(subscription.usage.users, subscription.plan.limits.maxUsers)
                )}`}
                style={{
                  width: `${getUsagePercentage(subscription.usage.users, subscription.plan.limits.maxUsers)}%`
                }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BillingPage;
