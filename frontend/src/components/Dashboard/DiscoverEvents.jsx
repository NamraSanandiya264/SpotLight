import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const DiscoverEvents = ({ setEventsToday, setActiveMenu }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const res = await api.get('/events/upcoming');
        if (res.data.success) {
          setEvents(res.data.events);
          if (setEventsToday) setEventsToday(res.data.eventsToday);
        }
      } catch (error) {
        console.error("Failed to fetch upcoming events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, [setEventsToday]);

  return (
    <div className="widget-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>Discover Campus Events</h3>
        <button 
          onClick={() => setActiveMenu('events')}
          style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500' }}
        >
          View Calendar →
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Loading events...</p>
      ) : events.length === 0 ? (
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>No upcoming events right now.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {events.map((event) => (
            <div 
              key={event._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                backgroundColor: '#F9FAFB'
              }}
            >
              {/* Date Box */}
              <div style={{ 
                backgroundColor: '#EFF6FF', 
                color: '#1D4ED8', 
                minWidth: '50px', 
                textAlign: 'center', 
                padding: '8px', 
                borderRadius: '8px' 
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric' })}
                </div>
              </div>

              {/* Event Details */}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#1F2937' }}>
                  {event.eventName}
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>
                  {event.organization?.name || 'Campus Club'} • {event.venue?.name || event.customVenue || 'TBA'}
                </p>
              </div>

              {/* Time */}
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#4B5563', fontWeight: '500' }}>
                {event.startTime}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscoverEvents;