import React from 'react';

const Header = ({ organization, user, isAdmin, logout, ThemeToggle }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
    <div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-white">
        🖥️ AssetFlow
      </h1>
      <p className="text-white/90 text-base sm:text-lg break-words max-w-xs sm:max-w-none">
        {organization?.name} - {user.name} {isAdmin && '(Admin)'}
      </p>
    </div>
    <div className="flex gap-2 sm:gap-3 items-center">
      <ThemeToggle />
      <button 
        onClick={logout}
        className="px-3 py-2 sm:px-4 sm:py-2 bg-white/20 hover:bg-white/30 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 text-white rounded-lg transition text-sm sm:text-base"
      >
        Logout
      </button>
    </div>
  </div>
);

export default Header;
