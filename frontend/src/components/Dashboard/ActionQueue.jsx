import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';

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
    <div className="widget-card" style={{ display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiClock color="#F59E0B" /> Priority Action Queue
        </h3>
        <button 
          onClick={() => setActiveMenu('bookings')}
          style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500' }}
        >
          View All →
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Loading queue...</p>
      ) : queue.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px dashed #E5E7EB' }}>
          <p style={{ margin: 0, color: '#10B981', fontWeight: '600' }}>Inbox Zero!</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#6B7280' }}>There are no pending requests right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {queue.map((item) => (
            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#FFFFFF' }}>
              
              {/* Request Details */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: item.purpose?.startsWith('Event:') ? '#F3E8FF' : '#E0F2FE', color: item.purpose?.startsWith('Event:') ? '#7E22CE' : '#0369A1', fontWeight: '600', textTransform: 'uppercase' }}>
                    {item.purpose?.startsWith('Event:') ? 'Event' : 'Room'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    {new Date(item.date).toLocaleDateString()} • {item.start_time}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', color: '#111827' }}>
                  {item.room_id?.name || 'Unknown Room'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#4B5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>
                  {item.purpose || 'No purpose specified'}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleAction(item._id, 'approved')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', border: 'none', backgroundColor: '#ECFDF5', color: '#059669', cursor: 'pointer', transition: 'background 0.2s' }}
                  title="Approve"
                >
                  <FiCheck size={18} />
                </button>
                <button 
                  onClick={() => handleAction(item._id, 'rejected')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', border: 'none', backgroundColor: '#FEF2F2', color: '#DC2626', cursor: 'pointer', transition: 'background 0.2s' }}
                  title="Reject"
                >
                  <FiX size={18} />
                </button>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionQueue;