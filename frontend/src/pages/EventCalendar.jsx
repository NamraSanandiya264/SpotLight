import { useState, useEffect } from "react";
import { getMonthlyCalendar } from "../services/api";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaClock, FaUsers } from "react-icons/fa";
import Swal from "sweetalert2";
import "./EventCalendar.css";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const EventCalendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); /* 1-12 */
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const res = await getMonthlyCalendar(currentMonth, currentYear);
        /* Handles grouping by date keys (YYYY-MM-DD) returned from service */
        setCalendarData(res.data.events || {});
      } catch (err) {
        console.error("Failed to load campus calendar:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, [currentMonth, currentYear]);

  /* Core Math for Calendar Grid Layout */
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankSpaces = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const showEventDetails = (event) => {
    Swal.fire({
      title: `<h3 class="swal-evt-title">${event.event_name}</h3>`,
      html: `
        <div class="swal-evt-body">
          <p><span class="swal-icon">🏢</span> <strong>Club/Org:</strong> ${event.organization?.name || "Campus Club"}</p>
          <p><span class="swal-icon">📍</span> <strong>Venue:</strong> ${event.venue}</p>
          <p><span class="swal-icon">⏰</span> <strong>Time:</strong> ${event.startTime} - ${event.endTime}</p>
          <hr class="swal-divider"/>
          <p class="swal-evt-desc">${event.description || "No description provided for this campus event."}</p>
        </div>
      `,
      confirmButtonText: "Awesome!",
      confirmButtonColor: "#2563eb",
      background: "#ffffff",
      buttonsStyling: true
    });
  };

  return (
    <div className="campus-calendar-container">
      <div className="calendar-control-header">
        <div className="title-section">
          <h2><FaCalendarAlt className="heading-icon" /> Campus Events Timeline</h2>
          <p>Explore cultural, sports, and club activities across campus</p>
        </div>
        <div className="navigation-actions">
          <button className="nav-arrow-btn" onClick={handlePrevMonth}><FaChevronLeft /></button>
          <span className="current-date-label">{MONTHS[currentMonth - 1]} {currentYear}</span>
          <button className="nav-arrow-btn" onClick={handleNextMonth}><FaChevronRight /></button>
        </div>
      </div>

      {loading ? (
        <div className="calendar-loader">Loading Campus Grid...</div>
      ) : (
        <div className="calendar-grid-workspace">
          {/* Weekday Headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="weekday-header-tile">{day}</div>
          ))}

          {/* Padding Spaces for Week Offset */}
          {blankSpaces.map(blank => (
            <div key={`blank-${blank}`} className="calendar-day-tile empty-day"></div>
          ))}

          {/* Actual Calendar Days */}
          {daysArray.map(day => {
            /* Construct standard database lookup key formatted as YYYY-MM-DD */
            const dayString = String(day).padStart(2, "0");
            const monthString = String(currentMonth).padStart(2, "0");
            const dateKey = `${currentYear}-${monthString}-${dayString}`;
            const dayEvents = calendarData[dateKey] || [];

            return (
              <div key={day} className="calendar-day-tile">
                <span className="day-number-label">{day}</span>
                <div className="day-events-wrapper">
                  {dayEvents.map(event => (
                    <div 
                      key={event._id} 
                      className="event-strip-item"
                      onClick={() => showEventDetails(event)}
                      title={event.event_name}
                    >
                      <span className="event-strip-dot"></span>
                      <span className="event-strip-text">{event.event_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventCalendar;