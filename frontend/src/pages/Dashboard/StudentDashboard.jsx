import { useState, useEffect } from "react";
import "./Dashboard.css";
import {
  checkAvailability,
  createBooking,
  getMyBookings,
  getAllRooms
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
  FaTimesCircle
} from "react-icons/fa";
import Swal from "sweetalert2"; 

const StudentDashboard = () => {
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

  const closeBookingPanel = () => {
    setShowPanel(false);
    setDate("");
    setStartTime("");
    setEndTime("");
    setSelectedRoom("");
    setPurpose("");
    setAvailabilityChecked(false);
    setStatusMessage({ text: "", type: "", icon: null });
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

  const approvedBookings = bookings.filter(b => 
    b.status === "approved" && b.date?.split('T')[0] >= today
  );

  const pastBookings = bookings.filter(b => 
    b.status === "rejected" || (b.status === "approved" && b.date?.split('T')[0] < today)
  );

  const handleInputMutation = (setter, value) => {
    setter(value);
    setAvailabilityChecked(false);
    setStatusMessage({ text: "", type: "", icon: null });
  };

  const handleCheckAvailability = async () => {
    setStatusMessage({ text: "", type: "", icon: null });
    if (!date || !startTime || !endTime || !selectedRoom) {
      setStatusMessage({ 
        text: "Please fill all fields", 
        type: "error",
        icon: <FaTimesCircle style={{ color: "#ef4444" }} />
      });
      return;
    }

    if (startTime >= endTime) {
      setStatusMessage({ 
        text: "Start time must be strictly before end time", 
        type: "error",
        icon: <FaTimesCircle style={{ color: "#ef4444" }} />
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
          icon: <FaTimesCircle style={{ color: "#ef4444" }} />
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
          icon: <FaCheckCircle style={{ color: "#10b981" }} />
        });
        setAvailabilityChecked(true);
      } else {
        setStatusMessage({ 
          text: "Room not available for this slot", 
          type: "error",
          icon: <FaTimesCircle style={{ color: "#ef4444" }} />
        });
        setAvailabilityChecked(false);
      }
    } catch (err) {
      setStatusMessage({ 
        text: "Server error during availability verification", 
        type: "error",
        icon: <FaTimesCircle style={{ color: "#ef4444" }} />
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
      });

      const newBooking = res.data.booking || res.data;
      setBookings((prev) => [newBooking, ...prev]);
      
      closeBookingPanel();
      
      Swal.fire({
        title: "Booking Submitted!",
        text: "Your reservation request has been sent to the SBG Core team for approval.",
        icon: "success",
        confirmButtonColor: "#2563eb",
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Booking creation failed";
      setStatusMessage({ 
        text: errorMsg, 
        type: "error",
        icon: <FaTimesCircle style={{ color: "#ef4444" }} />
      }); 
    }
  };

  const renderBookingCards = (list) => (
    <div className="booking-grid">
      {list.length === 0 ? (
        <p className="no-data">No records found</p>
      ) : (
        list.map((b, index) => (
          <div className="booking-card" key={b._id || index}>
            <div className="card-header">
              <span className={`status-badge ${b.status}`}>{b.status}</span>
            </div>
            
            <p><FaRegFileAlt className="icon" /> <strong>Purpose:</strong> {b.purpose}</p>
            
            <div className="booking-row">
              <span><FaDoorOpen className="icon" /> <strong>Room:</strong> {b.room_id?.name || "N/A"}</span>
            </div>
            
            <p><FaCalendarAlt className="icon" /> <strong>Date:</strong> {b.date ? b.date.split('T')[0] : "N/A"}</p>
            <p><FaClock className="icon" /> <strong>Time:</strong> {b.start_time} - {b.end_time}</p>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="student-dashboard">
      {/* 🌟 HEADING UPDATED: Standardized to Room Booking Portal */}
      <div className="dashboard-header">
        <h2>Room Booking Portal</h2>
        <button className="book-btn" onClick={() => setShowPanel(true)}>
          <FaPlus /> Book a Room
        </button>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          <FaHourglassHalf /> Pending ({pendingRequests.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === "approved" ? "active" : ""}`}
          onClick={() => setActiveTab("approved")}
        >
          <FaCheckCircle /> Confirmed ({approvedBookings.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory /> History ({pastBookings.length})
        </button>
      </div>

      <div className="sections-container">
        {activeTab === "pending" && (
          <div className="tab-content">
            <h3>Pending Requests</h3>
            {renderBookingCards(pendingRequests)}
          </div>
        )}

        {activeTab === "approved" && (
          <div className="tab-content">
            <h3>Confirmed Bookings</h3>
            {renderBookingCards(approvedBookings)}
          </div>
        )}

        {activeTab === "history" && (
          <div className="tab-content">
            <h3>Booking History</h3>
            {renderBookingCards(pastBookings)}
          </div>
        )}
      </div>

      {showPanel && (
        <div className="booking-panel">
          <button className="close-btn" onClick={closeBookingPanel}>✖</button>
          <h3>New Reservation</h3>

          <label>Date</label>
          <input 
            type="date" 
            className="input" 
            min={today} 
            value={date} 
            onChange={(e) => handleInputMutation(setDate, e.target.value)} 
          />

          <div className="time-row">
            <div>
              <label>Start</label>
              <input 
                type="time" 
                className="input" 
                value={startTime} 
                onChange={(e) => handleInputMutation(setStartTime, e.target.value)} 
              />
            </div>
            <div>
              <label>End</label>
              <input 
                type="time" 
                className="input" 
                value={endTime} 
                onChange={(e) => handleInputMutation(setEndTime, e.target.value)} 
              />
            </div>
          </div>

          <label>Purpose</label>
          <input 
            type="text" 
            className="input" 
            placeholder="Event name or reason"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />

          <label htmlFor="room-select">Select Room</label>
          <select
            id="room-select"
            className="input dropdown-select"
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

          {statusMessage.text && (
            <div className={`status-alert ${statusMessage.type}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {statusMessage.icon}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <button className="check-btn" onClick={handleCheckAvailability}>Check Availability</button>

          {availabilityChecked && <button className="submit-btn" onClick={handleBooking}>Confirm Booking</button>}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;