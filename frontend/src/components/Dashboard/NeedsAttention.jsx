import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { FiAlertCircle, FiCheckCircle, FiClock, FiXCircle, FiUsers } from 'react-icons/fi';

const NeedsAttention = ({ setActiveMenu }) => {
  const [tasks, setTasks] = useState({ pendingEvents: 0, rejectedEvents: 0 });
  const [pendingJoins, setPendingJoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttentionItems = async () => {
      try {
        const eventRes = await api.get('/events/deputy-view');
        // If the pending requests route fails, fallback to empty array safely
        const joinRes = await api.get('/organizations/pending-requests').catch(() => ({ data: { data: [] } }));
        
        let pending = 0;
        let rejected = 0;

        if (eventRes.data.success && eventRes.data.events) {
          eventRes.data.events.forEach(event => {
            const status = event.bookingRef?.status;
            if (status === 'pending') pending++;
            if (status === 'rejected') rejected++;
          });
        }

        setTasks({ pendingEvents: pending, rejectedEvents: rejected });
        
        if (joinRes.data?.data) {
          setPendingJoins(joinRes.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch attention items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttentionItems();
  }, []);

  if (loading) return null;

  const hasTasks = tasks.pendingEvents > 0 || tasks.rejectedEvents > 0 || pendingJoins.length > 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 transition-colors duration-300">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Club Alerts</h3>
      
      <div className={`flex items-center gap-2 mb-4 font-semibold text-sm ${hasTasks ? 'text-amber-600 dark:text-amber-500' : 'text-emerald-600 dark:text-emerald-500'}`}>
        {hasTasks ? (
          <><FiAlertCircle size={18} /> Pending action items</>
        ) : (
          <><FiCheckCircle size={18} /> All caught up!</>
        )}
      </div>

      {hasTasks && (
        <div className="flex flex-col gap-3">
          {pendingJoins.map((join, index) => (
            <div key={join.clubName ?? `join-${index}`} className="flex justify-between items-center p-4 rounded-xl bg-gray-50 dark:bg-slate-750 border border-gray-100 dark:border-slate-700 shadow-sm">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FiUsers className="text-blue-600 dark:text-blue-400" /> {join.count} Pending Request(s)
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">For {join.clubName}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveMenu('organizations')}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors"
              >
                Review
              </button>
            </div>
          ))}

          {tasks.pendingEvents > 0 && (
            <div className="flex justify-between items-center p-4 rounded-xl bg-gray-50 dark:bg-slate-750 border border-gray-100 dark:border-slate-700 shadow-sm">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FiClock className="text-amber-500" /> {tasks.pendingEvents} Event(s)
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Awaiting SBG approval</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveMenu('manage-events')}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors"
              >
                View
              </button>
            </div>
          )}

          {tasks.rejectedEvents > 0 && (
            <div className="flex justify-between items-center p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 shadow-sm">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FiXCircle className="text-red-500" /> {tasks.rejectedEvents} Event(s)
                </span>
                <span className="text-xs text-red-500/80 dark:text-red-400/80 mt-1">Rejected (Needs revision)</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveMenu('manage-events')}
                className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg transition-colors"
              >
                Fix
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

NeedsAttention.propTypes = {
  setActiveMenu: PropTypes.func.isRequired,
};

export default NeedsAttention;