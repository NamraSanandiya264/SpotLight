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
  const [expandedEventId, setExpandedEventId] = useState(null);

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

  const getThemeClass = (index) => {
    const themes = [
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
      'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
    ];
    return themes[index % 5];
  };

  return (
    <div className="w-full flex flex-col transition-colors duration-300 min-h-screen pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
            <FaCalendarAlt className="text-blue-600 dark:text-blue-400" /> Event Calendar
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Explore cultural, sports, and club activities across campus</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300" onClick={handlePrevMonth}>
            <FaChevronLeft />
          </button>
          <span className="font-bold text-gray-900 dark:text-gray-100 min-w-[140px] text-center">
            {MONTHS[currentMonth - 1]} {currentYear}
          </span>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300" onClick={handleNextMonth}>
            <FaChevronRight />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center p-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden flex-1">
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r last:border-r-0 border-gray-200 dark:border-slate-700">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 auto-rows-[120px]">
            {blankSpaces.map(blank => (
              <div key={`blank-${blank}`} className="border-b border-r border-gray-100 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-800/20"></div>
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
                  className={`border-b border-r border-gray-100 dark:border-slate-700/50 p-2 flex flex-col gap-1 transition-colors relative group ${
                    isToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'
                  } ${dayEvents.length > 0 ? 'cursor-pointer' : ''}`}
                  onClick={(e) => dayEvents.length > 0 && openDayListModal(e, formattedDate, dayEvents)}
                >
                  <div className="flex justify-end mb-1">
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium ${
                      isToday 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-700 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-slate-600 transition-colors'
                    }`}>
                      {day}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1 overflow-hidden flex-1">
                    {dayEvents.slice(0, 2).map((event, index) => {
                      const isPast = checkIsPast(event.date, event.endTime);
                      const themeClass = getThemeClass(index); 

                      return (
                        <div 
                          key={event._id} 
                          className={`text-xs px-2 py-1 rounded border truncate font-medium transition-transform hover:scale-[1.02] shadow-sm ${themeClass} ${isPast ? 'opacity-50 grayscale' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openSingleEventModal(event);
                          }}
                          title={event.eventName}
                        >
                          {event.eventName}
                        </div>
                      );
                    })}

                    {dayEvents.length >= 3 && (
                      <div 
                        className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300 text-center font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors mt-auto"
                        onClick={(e) => openDayListModal(e, formattedDate, dayEvents)}
                      >
                        + {dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals overlay */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in" onClick={closeModal}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform scale-100 transition-transform animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
              <button type="button" onClick={closeModal} className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors focus:outline-none" aria-label="Close modal">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {modalConfig.type === "single" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <FaBuilding className="text-blue-500 mt-1 shrink-0" />
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider block mb-0.5">Club/Org</span>
                      <span className="font-medium">{modalConfig.data.organization?.name || "Campus Club"}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <FaMapMarkerAlt className="text-red-500 mt-1 shrink-0" />
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider block mb-0.5">Venue</span>
                      <span className="font-medium">{modalConfig.data.customVenue || modalConfig.data.venue?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <FaClock className="text-amber-500 mt-1 shrink-0" />
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider block mb-0.5">Time</span>
                      <span className="font-medium">{modalConfig.data.startTime} - {modalConfig.data.endTime}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                    <FaAlignLeft className="text-gray-400 mt-1 shrink-0" />
                    <span className="text-sm leading-relaxed">{modalConfig.data.description || "No additional details provided."}</span>
                  </div>
                </div>
              )}

              {modalConfig.type === "list" && (
                <div className="flex flex-col gap-3">
                  {modalConfig.data.map((event, index) => (
                    <div 
                      key={event._id} 
                      className="flex flex-col gap-2 p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer group"
                      onClick={() => openSingleEventModal(event)} 
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">{event.startTime} - {event.endTime}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{event.organization?.name || "Club"}</span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{event.eventName}</span>
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
