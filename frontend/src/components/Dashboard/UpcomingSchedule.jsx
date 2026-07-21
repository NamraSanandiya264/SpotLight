import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const UpcomingSchedule = ({ setUpcomingCount }) => {
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const res = await api.get('/bookings/my'); 
        
        if (res.data && res.data.bookings) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const filtered = res.data.bookings.filter(booking => {
            const bookingDate = new Date(booking.date);
            return booking.status === 'approved' && bookingDate >= today;
          });

          filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

          setUpcomingBookings(filtered.slice(0, 4));

          if (setUpcomingCount) {
            setUpcomingCount(filtered.length);
          }
        }
      } catch (error) {
        console.error("Failed to fetch upcoming schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, [setUpcomingCount]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 flex flex-col transition-colors duration-300 min-h-[300px]">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">My Upcoming Schedule</h3>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : upcomingBookings.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center p-8 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
          <p className="text-gray-500 dark:text-gray-400">You have no upcoming approved bookings.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {upcomingBookings.map((booking) => (
            <div key={booking._id} className="flex justify-between items-center p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <div className="flex flex-col min-w-0 mr-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate mb-1">
                  {booking.room_id?.name || 'Unknown Room'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {booking.purpose || 'No purpose specified'}
                </p>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-600">
                  {booking.start_time} - {booking.end_time}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingSchedule;