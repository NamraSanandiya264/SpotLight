import React from 'react';

const QuickActions = ({ isCoreOrLeader, setActiveMenu }) => {
  
  return (
    <div className="widget-card">
      <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.2rem', color: '#333' }}>
        Quick Actions
      </h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '12px' 
      }}>
        
        <button 
          onClick={() => setActiveMenu('organizations')}
          style={actionButtonStyle}
        >
          Browse Clubs
        </button>

        <button 
          onClick={() => setActiveMenu('events')}
          style={actionButtonStyle}
        >
          Campus Calendar
        </button>

        {isCoreOrLeader && (
          <button 
            onClick={() => setActiveMenu('manage-events')}
            style={{ ...actionButtonStyle, backgroundColor: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' }}
          >
            + Create Event
          </button>
        )}
      </div>
    </div>
  );
};

const actionButtonStyle = {
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: '#F9FAFB',
  color: '#4B5563',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s',
  textAlign: 'center'
};

export default QuickActions;