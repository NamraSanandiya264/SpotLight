import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiAlertCircle, FiCheckCircle, FiClock, FiXCircle, FiUsers } from 'react-icons/fi';

const NeedsAttention = ({ setActiveMenu }) => {
  const [tasks, setTasks] = useState({ pendingEvents: 0, rejectedEvents: 0 });
  const [pendingJoins, setPendingJoins] = useState([]); // Array of { clubName, count }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttentionItems = async () => {
      try {
        // Fetch Event Pipeline
        const eventRes = await api.get('/events/deputy-view');
        // Fetch Pending Join Requests (Adjust this endpoint to match your backend)
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
        
        // Assuming joinRes.data.data returns an array like [{ clubName: 'Robotics', count: 3 }]
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
    <div className="widget-card" style={{ padding: '16px 20px', borderLeft: hasTasks ? '4px solid #F59E0B' : '4px solid #8820cd' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: hasTasks ? '12px' : '0' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#1F2937' }}>
          Club Alerts
        </h3>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '5px', marginBottom: '10px' }}>
        {hasTasks ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiAlertCircle color="#F59E0B" size={20} /> Pending action items
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiCheckCircle color="#8820cd" size={20} /> All caught up!
          </span>
        )}
      </p>

      {hasTasks && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Join Requests */}
          {pendingJoins.map((join, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#4B5563' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiUsers color="#2563EB" /> {join.count} Pending join request(s) for {join.clubName}
              </span>
              <button onClick={() => setActiveMenu('organizations')} style={linkBtnStyle}>Review</button>
            </div>
          ))}

          {/* Event Alerts */}
          {tasks.pendingEvents > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#4B5563' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiClock color="#D97706" /> {tasks.pendingEvents} Event(s) awaiting SBG approval
              </span>
              <button onClick={() => setActiveMenu('manage-events')} style={linkBtnStyle}>View</button>
            </div>
          )}
          
          {tasks.rejectedEvents > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#4B5563' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiXCircle color="#DC2626" /> {tasks.rejectedEvents} Event(s) rejected (Needs revision)
              </span>
              <button onClick={() => setActiveMenu('manage-events')} style={linkBtnStyle}>Fix</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const linkBtnStyle = { background: 'none', border: 'none', color: '#2563EB', fontWeight: '600', cursor: 'pointer', padding: 0 };

export default NeedsAttention;