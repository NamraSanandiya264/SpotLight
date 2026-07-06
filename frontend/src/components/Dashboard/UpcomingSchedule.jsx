import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './DashboardComponents.css';

const UpcomingSchedule = ({ setUpcomingCount }) => {
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        // Fetch all user bookings (adjust this endpoint if your route is named differently)
        const res = await api.get('/bookings/my'); 
        
        if (res.data && res.data.bookings) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Filter for approved bookings that are happening today or in the future
          const filtered = res.data.bookings.filter(booking => {
            const bookingDate = new Date(booking.date);
            return booking.status === 'approved' && bookingDate >= today;
          });

          // Sort by closest date first
          filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

          setUpcomingBookings(filtered.slice(0, 4)); // Show only the next 4

          // Update the Welcome Banner count
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
    <div className="widget-card">
      <h3 className="widget-section-title">My Upcoming Schedule</h3>

      {loading ? (
        <p className="widget-loading">Loading schedule...</p>
      ) : upcomingBookings.length === 0 ? (
        <p className="widget-loading">You have no upcoming approved bookings.</p>
      ) : (
        <div className="schedule-list">
          {upcomingBookings.map((booking) => (
            <div key={booking._id} className="schedule-item">
              <div>
                <h4 className="schedule-room-title">
                  {booking.room_id?.name || 'Unknown Room'}
                </h4>
                <p className="schedule-room-detail">
                  {booking.purpose || 'No purpose specified'}
                </p>
              </div>

              <div className="schedule-date">
                <p className="schedule-date-primary">
                  {new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
                <p className="schedule-time">
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