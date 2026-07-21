import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';
import Swal from 'sweetalert2';

const ActionQueue = ({ setActiveMenu }) => {
  const [queue, setQueue] = useState([]);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadQueue = useCallback(async () => {
    try {
      const res = await api.get('/bookings'); 
      if (res.data && res.data.bookings) {
        const pendingItems = res.data.bookings.filter(b => b.status === 'pending');
        setTotalPending(pendingItems.length);
        const oldestPending = pendingItems
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .slice(0, 4);
        setQueue(oldestPending);
      }
    } catch (error) {
      console.error("Failed to fetch action queue:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const handleAction = async (id, action) => {
    try {
      setQueue(prev => prev.filter(item => item._id !== id));
      setTotalPending(prev => Math.max(0, prev - 1));

      await api.patch(`/bookings/${id}/status`, { status: action });
      
      await loadQueue();
    } catch (error) {
      console.error(`Failed to process request:`, error);
      Swal.fire({
        title: "Error", 
        text: "Failed to process request. Reverting UI.", 
        icon: "error",
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#000000',
      });
      await loadQueue(); 
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 flex flex-col transition-colors duration-300 min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FiClock className="text-amber-500" /> Priority Action Queue
          {totalPending > 0 && (
            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full ml-2 font-medium">
              {totalPending} Pending
            </span>
          )}
        </h3>
        <button 
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          onClick={() => setActiveMenu('bookings')}
        >
          View All &rarr;
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : queue.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center p-8 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Inbox Zero!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            There are no pending requests right now.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {queue.map((item) => {
            const isEvent = item.purpose?.startsWith('Event:');

            return (
              <div key={item._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-750 shadow-sm hover:shadow-md transition-shadow gap-4">
                <div className="flex flex-col flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      isEvent 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {isEvent ? 'Event' : 'Room'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.date).toLocaleDateString()} &bull; {item.start_time}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                    {item.room_id?.name || 'Unknown Room'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {item.purpose || 'No purpose specified'}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                  <button
                    type="button"
                    onClick={() => handleAction(item._id, 'approved')}
                    className="flex-1 sm:flex-none flex items-center justify-center p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 rounded-lg transition-colors border border-emerald-100 dark:border-emerald-900/30 shadow-sm"
                    title="Approve"
                  >
                    <FiCheck size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(item._id, 'rejected')}
                    className="flex-1 sm:flex-none flex items-center justify-center p-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors border border-red-100 dark:border-red-900/30 shadow-sm"
                    title="Reject"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActionQueue;