import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FiBell } from 'react-icons/fi';
import api from '../../services/api';
import './DashboardComponents.css';

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
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <div className="dashboard-header welcome-banner">
      <div className="welcome-copy">
        <h2 className="welcome-title">{getGreeting()}, {firstName}</h2>
      </div>

      <div ref={dropdownRef} className="notification-wrapper">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="notification-button"
          aria-haspopup="true"
          aria-expanded={showDropdown}
        >
          <FiBell size={20} color="#4B5563" />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>

        {showDropdown && (
          <div className="notification-dropdown">
            <div className="notification-dropdown-header">
              <h4>Notifications</h4>
            </div>
            <div className="notification-dropdown-body">
              {notifications.length === 0 ? (
                <p className="notification-empty">No new notifications.</p>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif._id}
                    className={`notification-item ${notif.isRead ? '' : 'notification-unread'}`}
                  >
                    <p className="notification-item-message">{notif.message}</p>
                    <div className="notification-item-footer">
                      <span className="notification-date">{new Date(notif.createdAt).toLocaleDateString()}</span>
                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(notif._id)}
                          className="notification-mark-read"
                        >
                          Mark read
                        </button>
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

WelcomeBanner.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
  }),
};

WelcomeBanner.defaultProps = {
  user: { name: 'Student' },
};

export default WelcomeBanner;