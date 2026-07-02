import React, { useState, useEffect } from 'react';
import api from '../../services/api';

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
      <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem', color: '#333' }}>
        My Upcoming Schedule
      </h3>

      {loading ? (
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Loading schedule...</p>
      ) : upcomingBookings.length === 0 ? (
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>You have no upcoming approved bookings.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {upcomingBookings.map((booking) => (
            <div 
              key={booking._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                backgroundColor: '#F9FAFB'
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#1F2937' }}>
                  {booking.room_id?.name || 'Unknown Room'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>
                  {booking.purpose || 'No purpose specified'}
                </p>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>
                  {new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#2563EB', fontWeight: '500' }}>
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