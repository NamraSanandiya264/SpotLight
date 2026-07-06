import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';
import './DashboardComponents.css';

const ActionQueue = ({ setActiveMenu }) => {
  const [queue, setQueue] = useState([]);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Extract fetch logic into a reusable function
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

  // 2. Call it on initial load
  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // 3. Call it after an action to backfill the list
  const handleAction = async (id, action) => {
    try {
      setQueue(prev => prev.filter(item => item._id !== id));
      setTotalPending(prev => Math.max(0, prev - 1));

      await api.patch(`/bookings/${id}/status`, { status: action });
      
      await loadQueue();
    } catch (error) {
      console.error(`Failed to process request:`, error);
      alert('Failed to process request. Reverting UI.');
      await loadQueue(); 
    }
  };


  return (
    <div className="widget-card">
      <div className="widget-inner">
        <h3 className="widget-title">
          <FiClock color="#F59E0B" /> Priority Action Queue
          {totalPending > 0 && (
            <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px' }}>
              {totalPending} Pending
            </span>
          )}
        </h3>
        <button className="btn-link" onClick={() => setActiveMenu('bookings')}>
          View All →
        </button>
      </div>

      {loading ? (
        <p className="widget-loading">Loading queue...</p>
      ) : queue.length === 0 ? (
        <div className="empty-box">
          <p className="empty-box-title">
            Inbox Zero!
          </p>
          <p className="empty-box-text widget-small-text">
            There are no pending requests right now.
          </p>
        </div>
      ) : (
        <div className="widget-body">
          {queue.map((item) => {
            const badgeClass = item.purpose?.startsWith('Event:') ? 'event' : 'room';

            return (
              <div key={item._id} className="queue-item">
                <div className="queue-content">
                  <div className="queue-row">
                    <span className={`queue-badge ${badgeClass}`}>
                      {item.purpose?.startsWith('Event:') ? 'Event' : 'Room'}
                    </span>
                    <span className="widget-small-text">
                      {new Date(item.date).toLocaleDateString()} • {item.start_time}
                    </span>
                  </div>
                  <h4 className="queue-item-title">
                    {item.room_id?.name || 'Unknown Room'}
                  </h4>
                  <p className="queue-item-desc">
                    {item.purpose || 'No purpose specified'}
                  </p>
                </div>

                <div className="queue-actions">
                  <button
                    type="button"
                    onClick={() => handleAction(item._id, 'approved')}
                    className="icon-button approve"
                    title="Approve"
                  >
                    <FiCheck size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(item._id, 'rejected')}
                    className="icon-button reject"
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