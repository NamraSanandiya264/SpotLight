import { useState, useEffect } from "react";
import { getMonthlyCalendar } from "../../services/api";
import { 
  FaCalendarAlt, 
  FaChevronLeft, 
  FaChevronRight,
  FaTimes,
  FaBuilding,
  FaMapMarkerAlt,
  FaClock,
  FaAlignLeft,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";
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

  /* Accordion state for list view */
  const [expandedEventId, setExpandedEventId] = useState(null);

  /* Native Modal State Management */
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "none", 
    data: null,
    title: ""
  });

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

  /* Helper to visually mute past events */
  const checkIsPast = (dateString, endTimeStr) => {
    const now = new Date();
    const eventEnd = new Date(dateString);
    if (!endTimeStr) return eventEnd < now;

    const [hours, minutes] = endTimeStr.split(":").map(Number);
    eventEnd.setHours(hours, minutes, 0, 0);
    return eventEnd < now;
  };

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

  const openSingleEventModal = (event) => {
    setModalConfig({
      isOpen: true,
      type: "single",
      data: event,
      title: event.eventName
    });
  };

  const openDayListModal = (e, dateLabel, eventsList) => {
    e.stopPropagation();
    setExpandedEventId(null); 
    setModalConfig({
      isOpen: true,
      type: "list",
      data: eventsList,
      title: `Schedule for ${dateLabel}`
    });
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, type: "none", data: null, title: "" });
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankSpaces = Array.from({ length: firstDayOfMonth }, (_, i) => i);

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
                onClick={(e) => dayEvents.length > 0 && openDayListModal(e, formattedDate, dayEvents)}
              >
                <span className="day-number-label">{day}</span>
                
                <div className="day-events-wrapper">
                  {dayEvents.slice(0, 2).map((event, index) => {
                    const isPast = checkIsPast(event.date, event.endTime);
                    const themeClass = `theme-${index % 5}`; 

                    return (
                      <div 
                        key={event._id} 
                        className={`event-strip-item ${themeClass} ${isPast ? 'is-past' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openSingleEventModal(event);
                        }}
                        title={event.eventName}
                      >
                        <span className="event-strip-text">{event.eventName}</span>
                      </div>
                    );
                  })}

                  {dayEvents.length >= 3 && (
                    <div 
                      className="event-overflow-badge"
                      onClick={(e) => openDayListModal(e, formattedDate, dayEvents)}
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

      {/* Modal Rendering */}
      {modalConfig.isOpen && (
        <div className="calendar-modal-overlay" onClick={closeModal}>
          <div className="calendar-modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>
              <FaTimes />
            </button>
            
            <div className="modal-header">
              <h3>{modalConfig.title}</h3>
            </div>

            <div className="modal-body">
              {modalConfig.type === "single" && (
                <>
                  <div className="modal-detail-row">
                    <FaBuilding className="modal-icon" />
                    <span><strong>Club/Org:</strong> {modalConfig.data.organization?.name || "Campus Club"}</span>
                  </div>
                  <div className="modal-detail-row">
                    <FaMapMarkerAlt className="modal-icon" />
                    <span><strong>Venue:</strong> {modalConfig.data.customVenue || modalConfig.data.venue?.name}</span>
                  </div>
                  <div className="modal-detail-row">
                    <FaClock className="modal-icon" />
                    <span><strong>Time:</strong> {modalConfig.data.startTime} - {modalConfig.data.endTime}</span>
                  </div>
                  <div className="modal-detail-row modal-desc-box">
                    <FaAlignLeft className="modal-icon" />
                    <span>{modalConfig.data.description || "No additional details provided."}</span>
                  </div>
                </>
              )}

              {modalConfig.type === "list" && (
                <div className="modal-list-container">
                  {modalConfig.data.map(event => (
                    <div 
                      key={event._id} 
                      className="modal-list-item"
                      onClick={() => openSingleEventModal(event)} 
                    >
                      <div className="modal-list-meta">
                        <span className="modal-list-time">{event.startTime} - {event.endTime}</span>
                        <span className="modal-list-org">{event.organization?.name || "Club"}</span>
                      </div>
                      <div className="modal-list-title-row">
                        <span className="modal-list-title">{event.eventName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
