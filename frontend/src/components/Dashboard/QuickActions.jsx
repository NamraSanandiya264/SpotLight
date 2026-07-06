import React from 'react';
import './DashboardComponents.css';

const QuickActions = ({ isCoreOrLeader, setActiveMenu }) => {
  return (
    <div className="widget-card">
      <h3 className="widget-section-title large">Quick Actions</h3>

      <div className="action-grid">
        
        <button className="action-button" onClick={() => setActiveMenu('organizations')}>
          Browse Clubs
        </button>

        <button className="action-button" onClick={() => setActiveMenu('events')}>
          Campus Calendar
        </button>

        {isCoreOrLeader && (
          <button className="action-button primary" onClick={() => setActiveMenu('manage-events')}>
            + Create Event
          </button>
        )}
      </div>
    </div>
  );
};

export default QuickActions;