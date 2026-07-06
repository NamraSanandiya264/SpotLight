import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './DashboardComponents.css';

const DiscoverEvents = ({ setEventsToday }) => {
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
      <div className="discover-header">
        <h3 className="widget-section-title">Discover Campus Events</h3>
      </div>

      {loading ? (
        <p className="widget-loading">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="widget-loading">No upcoming events right now.</p>
      ) : (
        <div className="event-list">
          {events.map((event) => (
            <div key={event._id} className="event-card">
              <div className="event-date-box">
                <div className="event-month">
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                </div>
                <div className="event-day">
                  {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric' })}
                </div>
              </div>

              <div className="event-details">
                <h4 className="event-name">{event.eventName}</h4>
                <p className="event-meta">
                  {event.organization?.name || 'Campus Club'} • {event.venue?.name || event.customVenue || 'TBA'}
                </p>
              </div>

              <div className="event-time">{event.startTime}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscoverEvents;