import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { FiAlertCircle, FiCheckCircle, FiClock, FiXCircle, FiUsers } from 'react-icons/fi';
import './DashboardComponents.css';

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
    <div className={`widget-card attention-card ${hasTasks ? 'alert' : 'clear'}`}>
      <div className="attention-header">
        <h3 className="attention-title">Club Alerts</h3>
      </div>
      <p className="attention-status">
        {hasTasks ? (
          <>
            <FiAlertCircle color="#F59E0B" size={20} /> Pending action items
          </>
        ) : (
          <>
            <FiCheckCircle color="#8820cd" size={20} /> All caught up!
          </>
        )}
      </p>

      {hasTasks && (
        <div className="attention-list">
          {pendingJoins.map((join, index) => (
            <div key={join.clubName ?? `join-${index}`} className="attention-item">
              <span className="attention-item-meta">
                <FiUsers color="#2563EB" /> {join.count} Pending join request(s) for {join.clubName}
              </span>
              <button
                type="button"
                onClick={() => setActiveMenu('organizations')}
                className="attention-link-button"
              >
                Review
              </button>
            </div>
          ))}

          {tasks.pendingEvents > 0 && (
            <div className="attention-item">
              <span className="attention-item-meta">
                <FiClock color="#D97706" /> {tasks.pendingEvents} Event(s) awaiting SBG approval
              </span>
              <button
                type="button"
                onClick={() => setActiveMenu('manage-events')}
                className="attention-link-button"
              >
                View
              </button>
            </div>
          )}

          {tasks.rejectedEvents > 0 && (
            <div className="attention-item">
              <span className="attention-item-meta">
                <FiXCircle color="#DC2626" /> {tasks.rejectedEvents} Event(s) rejected (Needs revision)
              </span>
              <button
                type="button"
                onClick={() => setActiveMenu('manage-events')}
                className="attention-link-button"
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