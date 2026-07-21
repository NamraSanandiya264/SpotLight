import React from 'react';

const QuickActions = ({ isCoreOrLeader, setActiveMenu }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 transition-colors duration-300">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>

      <div className="flex flex-col gap-3">
        
        <button 
          className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-medium transition-colors border border-gray-100 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setActiveMenu('organizations')}
        >
          Browse Clubs
        </button>

        <button 
          className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-medium transition-colors border border-gray-100 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setActiveMenu('events')}
        >
          Campus Calendar
        </button>

        {isCoreOrLeader && (
          <button 
            className="w-full text-center px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            onClick={() => setActiveMenu('manage-events')}
          >
            + Create Event
          </button>
        )}
      </div>
    </div>
  );
};

export default QuickActions;