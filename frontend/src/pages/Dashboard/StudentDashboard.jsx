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
  FaClock
} from "react-icons/fa";
import { MdOutlineNotes } from "react-icons/md"; 

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
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
  const [activeTab, setActiveTab] = useState("pending");

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

  // --- FILTERING LOGIC ---
  // Using UTC date to avoid timezone shifts during comparison
  const today = new Date().toISOString().split('T')[0];

  const pendingRequests = bookings.filter(b => b.status === "pending");

  const approvedBookings = bookings.filter(b => 
    b.status === "approved" && b.date?.split('T')[0] >= today
  );

  const pastBookings = bookings.filter(b => 
    (b.status === "approved" && b.date?.split('T')[0] < today) || b.status === "rejected"
  );

  const handleCheckAvailability = async () => {
    setStatusMessage({ text: "", type: "" });
    if (!date || !startTime || !endTime || !selectedRoom) {
      setStatusMessage({ text: "Please fill all fields", type: "error" });
      return;
    }
    try {
      const res = await checkAvailability({
        room_id: selectedRoom,
        date,
        start_time: startTime,
        end_time: endTime,
      });

      if (res.data.available) {
        setStatusMessage({ text: "Room available ✅", type: "success" });
        setAvailabilityChecked(true);
      } else {
        setStatusMessage({ text: "Room not available ❌", type: "error" });
        setAvailabilityChecked(false);
      }
    } catch (err) {
      setStatusMessage({ text: "Server error during check", type: "error" });
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
      
      setShowPanel(false);
      setAvailabilityChecked(false);
      setPurpose("");
      alert("Booking Successful! Pending approval.");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Booking failed";
      setStatusMessage({ text: errorMsg, type: "error" }); 
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
            
            <p><MdOutlineNotes className="icon" /> <strong>Purpose:</strong> {b.purpose}</p>
            
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
      <div className="dashboard-header">
        <h2>My Dashboard</h2>
        <button className="book-btn" onClick={() => setShowPanel(true)}>
          <FaPlus /> Book a Room
        </button>
      </div>

      {/* --- NEW TAB NAVIGATION --- */}
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

      {/* --- CONDITIONAL CONTENT AREA --- */}
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
          <button className="close-btn" onClick={() => setShowPanel(false)}>✖</button>
          <h3>New Reservation</h3>

          <label>Date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />

          <div className="time-row">
            <div>
              <label>Start</label>
              <input type="time" className="input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <label>End</label>
              <input type="time" className="input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
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

          <label>Select Room</label>
          <div className="room-grid">
            {rooms.map((room) => (
              <div
                key={room._id}
                className={`room-tile ${selectedRoom === room._id ? "active" : ""}`}
                onClick={() => setSelectedRoom(room._id)}
              >
                {room.name}
              </div>
            ))}
          </div>

          {statusMessage.text && <div className={`status-alert ${statusMessage.type}`}>{statusMessage.text}</div>}

          <button className="check-btn" onClick={handleCheckAvailability}>Check Availability</button>
          {availabilityChecked && <button className="submit-btn" onClick={handleBooking}>Confirm Booking</button>}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;