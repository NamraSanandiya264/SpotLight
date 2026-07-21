import { useState, useEffect } from "react";
import {
  checkAvailability,
  createBooking,
  getMyBookings,
  getAllRooms,
  cancelBooking,
  getMyOrganizations
} from "../../services/api";
import { 
  FaHourglassHalf, 
  FaCheckCircle, 
  FaHistory, 
  FaPlus,
  FaDoorOpen,
  FaCalendarAlt,
  FaClock,
  FaRegFileAlt,
  FaTimesCircle,
  FaPhone
} from "react-icons/fa";
import Swal from "sweetalert2"; 

const StudentRoomBooking = ({user}) => {
  const [showPanel, setShowPanel] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [purpose, setPurpose] = useState("");
  const [bookings, setBookings] = useState([]);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "", icon: null });
  const [activeTab, setActiveTab] = useState("pending");
  const [contactNumber, setContactNumber] = useState(user?.phone || "");
  const [organization, setOrganization] = useState("");
  const [userOrgs, setUserOrgs] = useState([]); 
  
  const closeBookingPanel = () => {
    setShowPanel(false);
    setDate("");
    setStartTime("");
    setEndTime("");
    setSelectedRoom("");
    setPurpose("");
    setAvailabilityChecked(false);
    setStatusMessage({ text: "", type: "", icon: null });
    setOrganization(""); 
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [bookingRes, roomsRes] = await Promise.all([
          getMyBookings(),
          getAllRooms()
        ]);
        setBookings(bookingRes.data.bookings || []);
        setRooms(roomsRes.data.data || []);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };
    loadDashboardData();
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const pendingRequests = bookings.filter(b => b.status === "pending");
  const historyBookings = bookings.filter(b => b.status !== "pending");

  const handleInputMutation = (setter, value) => {
    setter(value);
    setAvailabilityChecked(false);
    setStatusMessage({ text: "", type: "", icon: null });
  };

  const handleCheckAvailability = async () => {
    setStatusMessage({ text: "", type: "", icon: null });
    if (!date || !startTime || !endTime || !selectedRoom || !contactNumber || !organization) {
      setStatusMessage({ 
        text: "Please fill all fields", 
        type: "error",
        icon: <FaTimesCircle className="text-red-500" />
      });
      return;
    }
    if (contactNumber.length !== 10) {
      setStatusMessage({ 
        text: "Please enter a valid 10-digit contact number", 
        type: "error",
        icon: <FaTimesCircle className="text-red-500" />
      });
      return;
    }
    if (startTime >= endTime) {
      setStatusMessage({ 
        text: "Start time must be strictly before end time", 
        type: "error",
        icon: <FaTimesCircle className="text-red-500" />
      });
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (date === todayStr) {
      const now = new Date();
      const currentLocalTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      if (startTime < currentLocalTime) {
        setStatusMessage({ 
          text: `You cannot book a past time slot. It is currently ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, 
          type: "error",
          icon: <FaTimesCircle className="text-red-500" />
        });
        setAvailabilityChecked(false);
        return;
      }
    }

    try {
      const res = await checkAvailability({
        room_id: selectedRoom,
        date,
        start_time: startTime,
        end_time: endTime,
      });

      if (res.data.available) {
        setStatusMessage({ 
          text: "Room available for booking", 
          type: "success",
          icon: <FaCheckCircle className="text-emerald-500" />
        });
        setAvailabilityChecked(true);
      } else {
        setStatusMessage({ 
          text: "Room not available for this slot", 
          type: "error",
          icon: <FaTimesCircle className="text-red-500" />
        });
        setAvailabilityChecked(false);
      }
    } catch (err) {
      console.error('Availability check failed:', err);
      setStatusMessage({ 
        text: `Server error during availability verification${err && err.message ? `: ${err.message}` : ''}`, 
        type: "error",
        icon: <FaTimesCircle className="text-red-500" />
      });
    }
  };

  const handleBooking = async () => {
    if (!availabilityChecked) return;

    try {
      const res = await createBooking({
        room_id: selectedRoom,
        date,
        start_time: startTime,
        end_time: endTime,
        purpose: purpose || "General Meeting",
        contact_number: contactNumber,
        organization: organization,
      });

      const newBooking = res.data.booking || res.data;
      setBookings((prev) => [newBooking, ...prev]);
      
      closeBookingPanel();
      
      Swal.fire({
        title: "Booking Submitted!",
        text: "Your reservation request has been sent to the SBG Core team for approval.",
        icon: "success",
        confirmButtonColor: "#2563eb",
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#000000',
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Booking creation failed";
      setStatusMessage({ 
        text: errorMsg, 
        type: "error",
        icon: <FaTimesCircle className="text-red-500" />
      }); 
    }
  };

  const handleCancelBooking = async (id) => {
    const result = await Swal.fire({
      title: "Cancel Booking?",
      text: "Are you sure you want to cancel this approved booking? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, cancel it",
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#000000',
    });

    if (!result.isConfirmed) return;

    try {
      await cancelBooking(id);
      setBookings((prev) => 
        prev.map((b) => (b._id === id ? { ...b, status: "canceled" } : b))
      );
      Swal.fire({
        title: "Canceled!", 
        text: "Your booking has been canceled.", 
        icon: "success",
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#000000',
      });
    } catch (err) {
      Swal.fire({
        title: "Error", 
        text: err.response?.data?.message || "Could not cancel booking", 
        icon: "error",
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#000000',
      });
    }
  };

  const isCancelable = (createdAt) => {
    if (!createdAt) return false;
    const timeDiff = new Date() - new Date(createdAt);
    const hoursPassed = timeDiff / (1000 * 60 * 60);
    return hoursPassed <= 24;
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'canceled': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };
  
  const getBorderClass = (status) => {
    switch (status) {
      case 'pending': return 'border-l-amber-500';
      case 'approved': return 'border-l-emerald-500';
      case 'rejected': return 'border-l-red-500';
      default: return 'border-l-gray-300';
    }
  };

  const renderBookingCards = (list) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {list.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 italic">No records found</p>
      ) : (
        list.map((b, index) => (
          <div className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 border-l-4 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4 relative overflow-hidden ${getBorderClass(b.status)}`} key={b._id || index}>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusClasses(b.status)}`}>
                {b.status}
              </span>
              {b.isEdited && (
                <span className="text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded-full">
                  ✏️ Edited
                </span>
              )}
            </div>
            
            <div className="mt-6 flex flex-col gap-3">
              <p className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <FaRegFileAlt className="text-gray-400 mt-1 shrink-0" /> 
                <span><strong className="text-gray-900 dark:text-gray-100">Purpose:</strong> {b.purpose}</span>
              </p>
              
              <p className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <FaDoorOpen className="text-gray-400 mt-1 shrink-0" /> 
                <span><strong className="text-gray-900 dark:text-gray-100">Room:</strong> {b.room_id?.name || "N/A"}</span>
              </p>
              
              <div className="flex gap-4">
                <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400 shrink-0" /> 
                  <span className="text-sm">{b.date ? b.date.split('T')[0] : "N/A"}</span>
                </p>
                <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FaClock className="text-gray-400 shrink-0" /> 
                  <span className="text-sm">{b.start_time} - {b.end_time}</span>
                </p>
              </div>
            </div>

            {b.status === "approved" && isCancelable(b.createdAt) &&(
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button 
                  className="flex items-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-4 py-2 rounded-lg text-sm font-medium transition-colors" 
                  onClick={() => handleCancelBooking(b._id)}
                >
                  <FaTimesCircle /> Cancel Booking
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const openBookingPanel = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setContactNumber(storedUser?.phone || storedUser?.contact_number || "");
    
    try {
      const res = await getMyOrganizations(); 
      console.log("API Response:", res.data); 
      
      const fetchedOrgs = Array.isArray(res.data) 
        ? res.data 
        : (res.data.data || res.data.organizations || res.data.clubs || []);
        
      setUserOrgs(fetchedOrgs);
    } catch (err) {
      console.error("Error fetching organizations", err);
    }
    
    setShowPanel(true);
  };

  return (
    <div className="w-full flex flex-col transition-colors duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Room Booking Portal</h2>
        <button 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900" 
          onClick={openBookingPanel}
        >
          <FaPlus /> Book a Room
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700 mb-8 overflow-x-auto pb-[-1px]">
        <button 
          className={`px-4 py-3 font-semibold flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "pending" 
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400" 
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
          onClick={() => setActiveTab("pending")}
        >
          <FaHourglassHalf /> Pending ({pendingRequests.length})
        </button>
        <button 
          className={`px-4 py-3 font-semibold flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "history" 
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400" 
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory /> History ({historyBookings.length})
        </button>
      </div>

      <div className="w-full">
        {activeTab === "pending" && (
          <div className="w-full animate-in fade-in duration-300">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">Pending Requests</h3>
            {renderBookingCards(pendingRequests)}
          </div>
        )}

        {activeTab === "history" && (
          <div className="w-full animate-in fade-in duration-300">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">Booking History</h3>
            {renderBookingCards(historyBookings)}
          </div>
        )}
      </div>

      {/* Slide-out Panel overlay logic */}
      {showPanel && (
        <div className="fixed inset-0 bg-gray-900/20 dark:bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity" onClick={closeBookingPanel}></div>
      )}

      {/* Slide-out Panel */}
      <div className={`fixed top-0 right-0 w-full sm:w-[450px] h-full bg-white dark:bg-slate-800 shadow-2xl z-50 p-6 sm:p-8 overflow-y-auto flex flex-col transform transition-transform duration-300 ease-in-out ${showPanel ? 'translate-x-0' : 'translate-x-full'}`}
           style={{ transform: showPanel ? 'translateX(0)' : 'translateX(100%)' }}>
        
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">New Reservation</h3>
          <button 
            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700" 
            onClick={closeBookingPanel}
          >
            ✖
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date</label>
            <input 
              type="date" 
              className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
              min={today} 
              value={date} 
              onChange={(e) => handleInputMutation(setDate, e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Start Time</label>
              <input 
                type="time" 
                className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
                value={startTime} 
                onChange={(e) => handleInputMutation(setStartTime, e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">End Time</label>
              <input 
                type="time" 
                className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
                value={endTime} 
                onChange={(e) => handleInputMutation(setEndTime, e.target.value)} 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Purpose</label>
            <input 
              type="text" 
              className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
              placeholder="Event name or reason"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contact Number</label>
            <input 
              type="tel" 
              className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
              placeholder="e.g., 9876543210"
              value={contactNumber}
              maxLength="10"
              onChange={(e) => handleInputMutation(setContactNumber, e.target.value.replace(/\D/g, ''))} 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="org-select" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Organization</label>
            <select
              id="org-select"
              className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm appearance-none"
              value={organization}
              onChange={(e) => handleInputMutation(setOrganization, e.target.value)}
            >
              <option value="" disabled>-- Select Organization --</option>
              <option value="None">None</option>
              {userOrgs.map((org, index) => (
                <option key={index} value={org.name || org.title || org}>
                  {org.name || org.title || org}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="room-select" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Select Room</label>
            <select
              id="room-select"
              className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm appearance-none"
              value={selectedRoom}
              onChange={(e) => handleInputMutation(setSelectedRoom, e.target.value)}
            >
              <option value="" disabled>-- Choose a Classroom/Lab --</option>
              
              {[...rooms]
                .sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, { numeric: true, sensitivity: 'base' }))
                .map((room) => (
                  <option key={room._id} value={room._id}>
                    {room.name}
                  </option>
                ))
              }
            </select>
          </div>

          {statusMessage.text && (
            <div className={`flex items-center gap-2 p-4 rounded-xl mt-4 text-sm font-medium ${
              statusMessage.type === 'error' 
                ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/30' 
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
            }`}>
              {statusMessage.icon}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <button 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800" 
              onClick={handleCheckAvailability}
            >
              Check Availability
            </button>

            {availabilityChecked && (
              <button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 animate-in fade-in slide-in-from-bottom-2" 
                onClick={handleBooking}
              >
                Confirm Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRoomBooking;
