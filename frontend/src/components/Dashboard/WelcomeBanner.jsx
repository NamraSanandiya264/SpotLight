import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
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
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
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
    <div className="relative flex flex-row flex-wrap items-start gap-3 sm:items-center sm:justify-between sm:gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm border border-blue-500/20 dark:border-slate-700 w-full transition-colors duration-300 overflow-visible">
      {/* Light mode decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-6 -right-6 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
      </div>
      <div className="relative z-10 min-w-0 flex-1">
        <h2 className="text-xl sm:text-2xl font-bold text-white dark:text-gray-100 tracking-tight leading-tight break-words">
          {getGreeting()}, <span className="text-cyan-200 dark:text-emerald-300">{firstName}</span>
        </h2>
        <p className="text-blue-100 dark:text-gray-400 text-sm mt-1">Here is what's happening today.</p>
      </div>

      <div ref={dropdownRef} className="relative z-20 self-start sm:self-auto ml-auto sm:ml-0">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative p-2.5 rounded-full bg-white/20 dark:bg-slate-700 hover:bg-white/30 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 dark:focus:ring-indigo-500"
          aria-haspopup="true"
          aria-expanded={showDropdown}
        >
          <FiBell size={20} className="text-white dark:text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 border-transparent rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-3 w-[min(22rem,calc(100vw-2rem))] sm:w-80 max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 z-[100] overflow-hidden transform origin-top-right transition-all duration-200 ease-out">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h4>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-center text-gray-500 dark:text-gray-400">No new notifications.</p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                  {notifications.map(notif => (
                    <div
                      key={notif._id}
                      className={`p-4 transition-colors ${
                        notif.isRead 
                          ? 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700' 
                          : 'bg-indigo-50/70 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border-l-4 border-indigo-500'
                      }`}
                    >
                      <p className={`text-sm ${notif.isRead ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100 font-medium'}`}>
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                        {!notif.isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(notif._id)}
                            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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