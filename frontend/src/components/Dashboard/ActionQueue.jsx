import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';
import './DashboardComponents.css';

const ActionQueue = ({ setActiveMenu }) => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingQueue = async () => {
      try {
        // Fetch all bookings, then filter for pending on the frontend 
        // (Or replace with a dedicated '/bookings/pending' endpoint if you have one)
        const res = await api.get('/bookings'); 
        if (res.data && res.data.bookings) {
          const pendingItems = res.data.bookings
            .filter(b => b.status === 'pending')
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .slice(0, 4); // Take the oldest 4 pending requests

          setQueue(pendingItems);
        }
      } catch (error) {
        console.error("Failed to fetch action queue:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingQueue();
  }, []);

  const handleAction = async (id, action) => {
    try {
      // Assuming your backend route is something like PATCH /bookings/:id/status
      await api.patch(`/bookings/${id}/status`, { status: action });
      
      // Remove the item from the UI queue immediately for a snappy feel
      setQueue(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
      alert(`Failed to process request. Please try again.`);
    }
  };

  return (
    <div className="widget-card">
      <div className="widget-inner">
        <h3 className="widget-title">
          <FiClock color="#F59E0B" /> Priority Action Queue
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