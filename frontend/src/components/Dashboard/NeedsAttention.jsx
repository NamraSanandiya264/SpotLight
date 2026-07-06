import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { FiAlertCircle, FiCheckCircle, FiClock, FiXCircle, FiUsers } from 'react-icons/fi';
import './DashboardComponents.css';

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
    <div className="widget-card">
      <h3 className="widget-section-title">Club Alerts</h3>
      
      <p className="widget-small-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: '600', color: hasTasks ? '#D97706' : '#059669' }}>
        {hasTasks ? (
          <><FiAlertCircle size={18} /> Pending action items</>
        ) : (
          <><FiCheckCircle size={18} /> All caught up!</>
        )}
      </p>

      {hasTasks && (
        <div className="attention-list">
          {pendingJoins.map((join, index) => (
            <div key={join.clubName ?? `join-${index}`} className="attention-item">
              <div className="attention-item-meta" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiUsers color="#2563EB" /> {join.count} Pending Request(s)
                  </span>
                  <span className="widget-small-text">For {join.clubName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMenu('organizations')}
                  className="btn-link"
                  style={{ padding: '4px 8px' }}
                >
                  Review
                </button>
              </div>
            </div>
          ))}

          {tasks.pendingEvents > 0 && (
            <div className="attention-item">
              <div className="attention-item-meta" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiClock color="#D97706" /> {tasks.pendingEvents} Event(s)
                  </span>
                  <span className="widget-small-text">Awaiting SBG approval</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMenu('manage-events')}
                  className="btn-link"
                  style={{ padding: '4px 8px' }}
                >
                  View
                </button>
              </div>
            </div>
          )}

          {tasks.rejectedEvents > 0 && (
            <div className="attention-item">
              <div className="attention-item-meta" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiXCircle color="#DC2626" /> {tasks.rejectedEvents} Event(s)
                  </span>
                  <span className="widget-small-text">Rejected (Needs revision)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMenu('manage-events')}
                  className="btn-link"
                  style={{ padding: '4px 8px' }}
                >
                  Fix
                </button>
              </div>
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