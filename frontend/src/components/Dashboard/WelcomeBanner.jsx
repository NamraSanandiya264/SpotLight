import React, { useState, useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import api from '../../services/api';

const WelcomeBanner = ({ user }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  // Fetch notifications for the dropdown
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data.success) {
          setNotifications(res.data.data);
          setUnreadCount(res.data.unreadCount);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      error("Failed to mark notification as read:", error);
    }
  };

  return (
    <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", position: "relative" }}>
      
      <div>
        <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "700", color: "#1E293B" }}>
          {getGreeting()}, {firstName}
        </h2>
      </div>

      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '10px', borderRadius: '50%', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
        >
          <FiBell size={20} color="#4B5563" />
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#EF4444', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '2px solid white' }}>
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div style={{ position: 'absolute', top: '50px', right: '0', width: '320px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <h4 style={{ margin: 0, color: '#1E293B' }}>Notifications</h4>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <p style={{ padding: '16px', margin: 0, color: '#6B7280', fontSize: '0.9rem', textAlign: 'center' }}>No new notifications.</p>
              ) : (
                notifications.map(notif => (
                  <div key={notif._id} style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', backgroundColor: notif.isRead ? '#FFFFFF' : '#EFF6FF', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#1F2937' }}>{notif.message}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>{new Date(notif.createdAt).toLocaleDateString()}</span>
                      {!notif.isRead && (
                        <button onClick={() => handleMarkAsRead(notif._id)} style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>Mark read</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeBanner;