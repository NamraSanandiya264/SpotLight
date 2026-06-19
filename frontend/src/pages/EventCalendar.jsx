import { useState, useEffect } from "react";
import { getMonthlyCalendar } from "../services/api";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Swal from "sweetalert2";
import "./EventCalendar.css";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const EventCalendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const res = await getMonthlyCalendar(currentMonth, currentYear);
        setCalendarData(res.data.events || {});
      } catch (err) {
        console.error("Failed to load campus calendar:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, [currentMonth, currentYear]);

  // 🌟 Global Event Bridge Handler initialized properly on mount/update context
  useEffect(() => {
    window.dispatchSwalEvent = (encodedEvent) => {
      const event = JSON.parse(decodeURIComponent(encodedEvent));
      Swal.close();
      setTimeout(() => showEventDetails(event), 200);
    };

    return () => {
      delete window.dispatchSwalEvent;
    };
  }, []);

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
    const editedBadge = event.isEdited 
      ? `<span style="color:#1d4ed8; font-size:11px; background:#dbeafe; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">✏️ Edited</span>` 
      : "";

    Swal.fire({
      title: `<h3 class="swal-evt-title">${event.eventName}${editedBadge}</h3>`,
      html: `
        <div class="swal-evt-body">
          <p><span>🏢</span> <strong>Club/Org:</strong> ${event.organization?.name || "Campus Club"}</p>
          <p><span>📍</span> <strong>Venue:</strong> ${event.venue?.name || "Campus Venue"}</p>
          <p><span>⏰</span> <strong>Time:</strong> ${event.startTime} - ${event.endTime}</p>
          <hr class="swal-divider"/>
          <p class="swal-evt-desc">${event.description || "No description provided for this campus event."}</p>
        </div>
      `,
      confirmButtonText: "Awesome!",
      confirmButtonColor: "#2563eb",
      background: "#ffffff"
    });
  };

  const showFullDayView = (e, dateLabel, allEvents) => {
    e.stopPropagation();
    
    const eventsListHtml = allEvents.map(event => `
      <div class="swal-day-list-item" onclick="window.dispatchSwalEvent('${encodeURIComponent(JSON.stringify(event))}')">
        <div class="swal-day-list-meta">
          <span class="swal-day-list-time">⏰ ${event.startTime} - ${event.endTime}</span>
          <span class="swal-day-list-org">🏢 ${event.organization?.name || "Club"}</span>
        </div>
        <div class="swal-day-list-title">📍 ${event.venue?.name || "Campus Venue"} | <strong>${event.eventName}</strong></div>
      </div>
    `).join("");

    Swal.fire({
      title: `<h3 class="swal-evt-title">Schedule for ${dateLabel}</h3>`,
      html: `<div class="swal-day-list-container">${eventsListHtml}</div>`,
      showConfirmButton: true,
      confirmButtonText: "Close",
      confirmButtonColor: "#2563eb",
      width: "500px"
    });
  };

  return (
    <div className="campus-calendar-container">
      <div className="calendar-control-header">
        <div className="title-section">
          <h2><FaCalendarAlt className="heading-icon" /> Event Calendar</h2>
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
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="weekday-header-tile">{day}</div>
          ))}

          {blankSpaces.map(blank => (
            <div key={`blank-${blank}`} className="calendar-day-tile empty-day"></div>
          ))}

          {daysArray.map(day => {
            const dayString = String(day).padStart(2, "0");
            const monthString = String(currentMonth).padStart(2, "0");
            const dateKey = `${currentYear}-${monthString}-${dayString}`;
            const dayEvents = calendarData[dateKey] || [];

            const isToday = 
              today.getDate() === day && 
              today.getMonth() + 1 === currentMonth && 
              today.getFullYear() === currentYear;

            const formattedDate = `${dayString}/${monthString}/${currentYear}`;

            return (
              <div 
                key={day} 
                className={`calendar-day-tile ${isToday ? 'is-today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
                onClick={(e) => dayEvents.length > 0 && showFullDayView(e, formattedDate, dayEvents)}
              >
                <span className="day-number-label">{day}</span>
                
                <div className="day-events-wrapper">
                  {dayEvents.slice(0, 2).map(event => (
                    <div 
                      key={event._id} 
                      className="event-strip-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        showEventDetails(event);
                      }}
                      title={event.eventName}
                    >
                      <span className="event-strip-dot"></span>
                      <span className="event-strip-text">{event.eventName}</span>
                    </div>
                  ))}

                  {dayEvents.length >= 3 && (
                    <div 
                      className="event-overflow-badge"
                      onClick={(e) => showFullDayView(e, formattedDate, dayEvents)}
                    >
                      + {dayEvents.length - 2}
                    </div>
                  )}
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