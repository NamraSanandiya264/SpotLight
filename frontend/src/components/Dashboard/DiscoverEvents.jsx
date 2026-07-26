import React, { useState, useEffect } from 'react';
import api from '../../services/api';

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
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 flex flex-col transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Discover Campus Events</h3>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="py-8 text-center bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
          <p className="text-gray-500 dark:text-gray-400">No upcoming events right now.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event) => (
            <div key={event._id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow items-start sm:items-center justify-between">
              
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/30 rounded-lg min-w-[60px] h-[60px] p-2 border border-blue-100 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 shrink-0">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-lg font-bold">
                    {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric' })}
                  </span>
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate mb-1">{event.eventName}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {event.organization?.name || 'Campus Club'} &bull; {event.venue?.name || event.customVenue || 'TBA'}
                  </p>
                </div>
              </div>

              <div className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 shrink-0">
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