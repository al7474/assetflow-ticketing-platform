import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTier, setCurrentTier] = useState('FREE');
  const [fetchingPlan, setFetchingPlan] = useState(true);

  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/subscription/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCurrentTier(response.data.tier);
    } catch (err) {
      console.error('Failed to fetch current plan:', err);
    } finally {
      setFetchingPlan(false);
    }
  };

  const handleSubscribe = async (tier) => {
    if (tier === currentTier) {
      alert('ℹ️ You are already on this plan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Use demo upgrade endpoint (no Stripe required)
      const response = await axios.post(
        `${API_URL}/api/subscription/demo-upgrade`,
        { tier },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Success - refresh the page to show new plan
      const action = tier === 'FREE' ? 'downgraded' : (currentTier === 'FREE' ? 'upgraded' : 'changed');
      alert(`✅ Successfully ${action} to ${tier} plan!\n\n${response.data.message}`);
      await fetchCurrentPlan(); // Refresh current plan
      setLoading(false);
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err.response?.data?.error || 'Failed to upgrade plan');
      setLoading(false);
    }
  };

  const plans = [
    {
      tier: 'FREE',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Up to 5 assets',
        'Up to 10 tickets',
        'Up to 2 users',
        'Basic analytics',
        'Email support'
      ]
    },
    {
      tier: 'PRO',
      name: 'Pro',
      price: '$29',
      period: 'per month',
      features: [
        'Up to 50 assets',
        'Unlimited tickets',
        'Up to 10 users',
        'Advanced analytics',
        'Priority email support',
        'Custom branding'
      ],
      popular: true
    },
    {
      tier: 'ENTERPRISE',
      name: 'Enterprise',
      price: '$99',
      period: 'per month',
      features: [
        'Unlimited assets',
        'Unlimited tickets',
        'Unlimited users',
        'Advanced analytics',
        'Dedicated support',
        'Custom branding',
        'API access',
        'SLA guarantee'
      ]
    }
  ];

  const getButtonText = (tier) => {
    if (fetchingPlan) return 'Loading...';
    if (tier === currentTier) return '✓ Current Plan';
    if (tier === 'FREE') return '⬇️ Downgrade to Free';
    if (tier === 'PRO' && currentTier === 'ENTERPRISE') return '⬇️ Downgrade to Pro';
    return `⬆️ Upgrade to ${tier === 'PRO' ? 'Pro' : 'Enterprise'}`;
  };

  const isButtonDisabled = (tier) => {
    return tier === currentTier || loading || fetchingPlan;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Demo Mode Banner */}
        <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-lg">🚀 Demo Mode Active</span>
          </div>
          <p className="mt-2 text-sm opacity-90">
            All features unlocked for testing • Upgrades are instant • No payment required
          </p>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Select the perfect plan for your organization's needs
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-center">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-blue-600 transform scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.tier)}
                  disabled={isButtonDisabled(plan.tier)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.tier === currentTier
                      ? 'bg-green-100 text-green-800 cursor-not-allowed border-2 border-green-500'
                      : plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-800 text-white hover:bg-gray-900'
                  } ${loading || fetchingPlan ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {getButtonText(plan.tier)}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PricingPage;
