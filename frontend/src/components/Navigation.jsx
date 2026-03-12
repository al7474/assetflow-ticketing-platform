import React from 'react';

const Navigation = ({ isAdmin, viewMode, setViewMode }) => (
  <div className="flex gap-2 sm:gap-4 justify-center mb-6 sm:mb-8 flex-wrap">
    {isAdmin && (
      <button 
        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
          viewMode === 'dashboard' 
            ? 'bg-white dark:bg-gray-700 border-2 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' 
            : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:-translate-y-0.5'
        }`}
        onClick={() => setViewMode('dashboard')}
      >
        📊 Dashboard
      </button>
    )}
    <button 
      className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
        viewMode === 'assets' 
          ? 'bg-white dark:bg-gray-700 border-2 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' 
          : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:-translate-y-0.5'
      }`}
      onClick={() => setViewMode('assets')}
    >
      📦 Assets
    </button>
    {isAdmin && (
      <button 
        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
          viewMode === 'tickets' 
            ? 'bg-white dark:bg-gray-700 border-2 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' 
            : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:-translate-y-0.5'
        }`}
        onClick={() => setViewMode('tickets')}
      >
        🎫 Tickets
      </button>
    )}
    <button 
      className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
        viewMode === 'pricing' 
          ? 'bg-white dark:bg-gray-700 border-2 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' 
          : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:-translate-y-0.5'
      }`}
      onClick={() => setViewMode('pricing')}
    >
      💳 Pricing
    </button>
    <button 
      className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
        viewMode === 'billing' 
          ? 'bg-white dark:bg-gray-700 border-2 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' 
          : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:-translate-y-0.5'
      }`}
      onClick={() => setViewMode('billing')}
    >
      🧾 Billing
    </button>
  </div>
);

export default Navigation;
