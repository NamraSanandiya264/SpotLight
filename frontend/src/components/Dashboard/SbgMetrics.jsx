import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiGrid, FiCalendar, FiMapPin, FiRadio } from 'react-icons/fi';

const SbgMetrics = ({ setActiveMenu }) => {
  const [metrics, setMetrics] = useState({
    pendingRooms: 0,
    pendingEvents: 0,
    roomsOccupiedToday: 0,
    liveEventsThisWeek: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/users/sbg-metrics');
        if (res.data.success) {
          setMetrics(res.data.metrics);
        }
      } catch (error) {
        console.error("Failed to fetch SBG metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) return <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Loading system metrics...</p>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      
      <MetricCard 
        title="Pending Rooms" 
        value={metrics.pendingRooms} 
        icon={<FiGrid size={24} color="#D97706" />} 
        bgColor="#FEF3C7" 
        onClick={() => setActiveMenu('bookings')}
      />
      
      <MetricCard 
        title="Pending Events" 
        value={metrics.pendingEvents} 
        icon={<FiCalendar size={24} color="#2563EB" />} 
        bgColor="#EFF6FF" 
        onClick={() => setActiveMenu('bookings')} // Assuming event approvals also happen in the CoreRoomBooking view
      />
      
      <MetricCard 
        title="Rooms Active Today" 
        value={metrics.roomsOccupiedToday} 
        icon={<FiMapPin size={24} color="#059669" />} 
        bgColor="#ECFDF5" 
      />
      
      <MetricCard 
        title="Events This Week" 
        value={metrics.liveEventsThisWeek} 
        icon={<FiRadio size={24} color="#7C3AED" />} 
        bgColor="#F5F3FF" 
      />

    </div>
  );
};

const MetricCard = ({ title, value, icon, bgColor, onClick }) => (
  <div 
    onClick={onClick}
    style={{
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => onClick && (e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={(e) => onClick && (e.currentTarget.style.transform = 'none')}
  >
    <div style={{
      background: bgColor,
      padding: '12px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {icon}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', lineHeight: '1' }}>
        {value}
      </span>
      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748B', marginTop: '6px' }}>
        {title}
      </span>
    </div>
  </div>
);

export default SbgMetrics;