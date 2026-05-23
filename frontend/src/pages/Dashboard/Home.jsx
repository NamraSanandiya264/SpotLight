import { useState, useEffect } from "react";
import { FaCalendarDay, FaMapMarkerAlt, FaClock, FaBell, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./Home.css";

const Home = () => {
  const { user } = useAuth();

  // Mock data representing structural items from your combined collections
  const [timeline, setTimeline] = useState([
    { id: 1, type: "event", time: "10:30 AM", title: "Peer Review Session", location: "Conference Room A" },
    { id: 2, type: "booking", time: "03:00 PM", title: "Core Team Sync Sync", location: "CEP107" }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, type: "success", text: "Room Reservation Approved", meta: "10m ago" },
    { id: 2, type: "warning", text: "Review Starts Soon", meta: "12m ago" }
  ]);

  // Featured Banner spotlight state matching your active university database entries
  const [featuredEvent, setFeaturedEvent] = useState({
    title: "Garba Night 2026",
    tagline: "Dust off your chaniya cholis and kediyus for the biggest cultural celebration of the semester!",
    startTime: "10:30 AM",
    endTime: "12:00 PM",
    venue: "Conference Room A"
  });

  return (
    <div className="home-dashboard-viewport">
      
      {/* 1. TOP GLOBAL NAVIGATION HEADER */}
      <header className="home-viewport-header">
        <div className="header-context">
          <h1>Welcome Back, {user?.name || "Student"} 👋</h1>
          <p>Here is what's happening on campus today.</p>
        </div>
        <div className="header-widgets-wrapper">
          <div className="notification-bell-badge" title="Notifications">
            <FaBell />
            <span className="badge-count">3</span>
          </div>
          <div className="user-avatar-widget" title="View Profile">
            {user?.name ? user.name.split(" ").map(n => n[0]).join("") : "U"}
          </div>
        </div>
      </header>

      {/* 2. FLAGSHIP EVENT SPOTLIGHT BANNER */}
      {featuredEvent && (
        <section className="spotlight-banner-card">
          <div className="banner-overlay-content">
            <span className="live-pill-tag">Happening Today</span>
            <h2>{featuredEvent.title}</h2>
            <p className="banner-tagline-text">{featuredEvent.tagline}</p>
            
            <div className="banner-metadata-row">
              <span className="meta-pill-item">
                <FaClock className="meta-icon" /> {featuredEvent.startTime} - {featuredEvent.endTime}
              </span>
              <span className="meta-pill-item">
                <FaMapMarkerAlt className="meta-icon" /> {featuredEvent.venue}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 3. SPLIT COMPONENT LAYOUT GRID */}
      <div className="home-workspace-split-grid">
        
        {/* Column A: Today's Itinerary Hub */}
        <section className="workspace-panel-card grid-column-main">
          <h3><FaCalendarDay className="panel-heading-icon" /> Today's Timeline</h3>
          <div className="timeline-vertical-feed">
            {timeline.length === 0 ? (
              <p className="empty-panel-text">No activities scheduled for today.</p>
            ) : (
              timeline.map((item) => (
                <div className="timeline-itinerary-node" key={item.id}>
                  <div className="timeline-time-anchor">{item.time}</div>
                  <div className="timeline-connector-bar">
                    <div className={`timeline-indicator-dot ${item.type}`}></div>
                  </div>
                  <div className="timeline-content-bubble">
                    <h4>{item.title}</h4>
                    <p><FaMapMarkerAlt /> {item.location}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Column B: Recent Activity Panel */}
        <section className="workspace-panel-card grid-column-side">
          <h3>Recent Notifications</h3>
          <div className="notifications-vertical-stack">
            {notifications.length === 0 ? (
              <p className="empty-panel-text">No recent updates to display.</p>
            ) : (
              notifications.map((notif) => (
                <div className={`notification-alert-tile ${notif.type}`} key={notif.id}>
                  <div className="alert-icon-wrapper">
                    {notif.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
                  </div>
                  <div className="alert-text-body">
                    <p className="alert-main-text">{notif.text}</p>
                    <span className="alert-meta-timestamp">{notif.meta}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;