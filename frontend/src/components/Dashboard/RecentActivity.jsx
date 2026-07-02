import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await api.get('/users/activity');
        if (res.data.success) {
          setActivities(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  // Time formatter (e.g., "2 hours ago", "Yesterday")
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays === 1) return `Yesterday`;
    return date.toLocaleDateString();
  };

  return (
    <div className="widget-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem', color: '#333' }}>
        Recent Activity
      </h3>

      {loading ? (
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Loading timeline...</p>
      ) : activities.length === 0 ? (
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>No recent activity to show.</p>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '12px' }}>
          {/* Vertical timeline line */}
          <div style={{ 
            position: 'absolute', 
            left: '17px', 
            top: '8px', 
            bottom: '0', 
            width: '2px', 
            backgroundColor: '#E5E7EB' 
          }}></div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activities.map((activity) => (
              <li key={activity.id} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                {/* Timeline Dot */}
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: activity.type === 'booking' ? '#3B82F6' : '#10B981', 
                  marginTop: '4px',
                  zIndex: 1 
                }}></div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#1F2937', fontWeight: '500' }}>
                    {activity.title}
                  </p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#6B7280' }}>
                    {activity.description}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#9CA3AF' }}>
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;