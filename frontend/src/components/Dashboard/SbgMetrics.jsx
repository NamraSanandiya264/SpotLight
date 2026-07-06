import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiGrid, FiCalendar, FiMapPin, FiRadio } from 'react-icons/fi';
import './DashboardComponents.css';

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

  if (loading) return <p className="loading-text">Loading system metrics...</p>;

  return (
    <div className="widget-card">
      <h3 className="widget-title section-title">System Overview</h3>
      <div className="metrics-list">
        <MetricCard title="Pending Rooms" value={metrics.pendingRooms} icon={<FiGrid />} iconClass="pending-rooms" bgColor="#FEF3C7" onClick={() => setActiveMenu('bookings')} />
        <MetricCard title="Pending Events" value={metrics.pendingEvents} icon={<FiCalendar />} iconClass="pending-events" bgColor="#EFF6FF" onClick={() => setActiveMenu('bookings')} />
        <MetricCard title="Active Today" value={metrics.roomsOccupiedToday} icon={<FiMapPin />} iconClass="active-today" bgColor="#ECFDF5" />
        <MetricCard title="Events This Week" value={metrics.liveEventsThisWeek} icon={<FiRadio />} iconClass="events-week" bgColor="#F5F3FF" />
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, bgColor, onClick }) => (
  <div 
    className={`metric-card ${onClick ? 'clickable' : ''}`} 
    onClick={onClick}
  >
    <div className="metric-icon" style={{ backgroundColor: bgColor }}>
      {icon}
    </div>
    <div className="metric-content">
      <span className="metric-value">{value}</span>
      <span className="metric-label">{title}</span>
    </div>
  </div>
);

export default SbgMetrics;