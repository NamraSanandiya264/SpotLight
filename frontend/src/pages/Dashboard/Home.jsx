import { useEffect, useState } from "react";
import { FaClock, FaMapMarkerAlt, FaBullhorn, FaCalendarDay } from "react-icons/fa";
import api from "../../services/api";
import { getEventsByDay } from "../../services/api";
import "./Home.css";

const Home = () => {
  const [userName, setUserName] = useState("Ishti"); // Defaulting to your profile name
  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState("");
  const [todayEvents, setTodayEvents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded quotes for instant local rotation, can easily be tied to an AI endpoint later!
  const quotes = [
    "The beautiful thing about learning is that no one can take it away from you. – B.B. King",
    "Your focus determines your reality. Make today count on campus!",
    "Excellence is not a skill. It is an attitude. Approach your labs today with fire.",
    "Don't compromise your career path for temporary comfort. Stay aligned to your tech goals!"
  ];

  useEffect(() => {
    // 1. Determine time-of-day greeting context
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting("Good Morning");
    else if (hrs < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // 2. Select a random quote for the day rotation
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);

    // 3. Fetch data dashboard payload for Today
    fetchDashboardContent();
  }, []);

  const fetchDashboardContent = async () => {
    try {
      setLoading(true);
      
      // Calculate today's localized exact ISO formatting date anchor string (YYYY-MM-DD)
      const todayIST = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      
      // Hit our simultaneous database endpoints smoothly
      const [eventsRes, noticesRes] = await Promise.all([
        getEventsByDay(todayIST), // 🌟 Now hitting the real calendar controller!
        api.get("/notices/active").catch(() => ({ data: { success: true, notices: [] } })) // Fallback guard if notice collection is still empty
      ]);

      if (eventsRes.data.success) {
        setTodayEvents(eventsRes.data.events || []);
      }
      if (noticesRes.data.notices) {
        setNotices(noticesRes.data.notices || []);
      }
      
    } catch (err) {
      console.error("Failed loading live calendar syncing elements:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-dashboard-workspace">
      
      {/* SECTION 1: Dynamic Personalized Welcoming Header */}
      <header className="dashboard-welcome-hero">
        <h1 className="welcome-greeting-title">
          {greeting}, <span className="highlight-username">{userName}</span>! 👋
        </h1>
        <div className="daily-quote-card">
          <p className="quote-text">“ {quote} ”</p>
        </div>
      </header>

      {/* SECTION 2: Split Informational Activity Feed Layout */}
      <div className="dashboard-split-feed-grid">
        
        {/* LEFT COLUMN: Today's Interactive Timelines */}
        <div className="feed-column events-today-card-block">
          <div className="column-header-row">
            <h3><FaCalendarDay className="icon-accent blue" /> Happening Today</h3>
            <span className="live-pill-badge">Live Counter ({todayEvents.length})</span>
          </div>

          <div className="feed-scroll-container">
            {todayEvents.length > 0 ? (
              todayEvents.map(event => (
                <div key={event._id} className="live-event-ticker-row">
                  <div className="ticker-time-pill">
                    <FaClock /> {event.startTime}
                  </div>
                  <div className="ticker-details-stack">
                    <h4 className="ticker-event-title">{event.eventName}</h4>
                    <div className="ticker-meta-line">
                      <span className="ticker-venue"><FaMapMarkerAlt /> {event.venue}</span>
                      <span className="ticker-org">🏢 {event.organization?.name}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-feed-fallback">
                <p>No major events scheduled on the public calendar for today.</p>
                <span className="sub-fallback">Enjoy a peaceful day or catch up on coding templates!</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SBG Official Board Notices */}
        <div className="feed-column sbg-notice-board-block">
          <div className="column-header-row">
            <h3><FaBullhorn className="icon-accent amber" /> SBG Notice Board</h3>
            <span className="official-tag">Official Desk</span>
          </div>

          <div className="feed-scroll-container">
            {notices.length > 0 ? (
              notices.map(notice => (
                <div key={notice._id} className="notice-sticky-card">
                  <div className="notice-card-header">
                    <h4 className="notice-subject-heading">{notice.title}</h4>
                    <span className="notice-timestamp">
                      {new Date(notice.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="notice-body-text">{notice.content}</p>
                  <div className="notice-footer-signature">
                    — Issued by <strong>{notice.postedBy || "Student Representative Body"}</strong>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-feed-fallback">
                <p>The notice board is currently clear.</p>
                <span className="sub-fallback">Check back later for official announcements regarding club elections or events.</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Home;