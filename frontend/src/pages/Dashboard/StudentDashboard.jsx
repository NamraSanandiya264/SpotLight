import { useState, useEffect } from "react";
import "./Dashboard.css";
import {
  checkAvailability,
  createBooking,
  getMyBookings,
  getAllRooms
} from "../../services/api";

// const roomsList = [
//     {id: "69ca46521718d585ddc20da2", name: "CEP107"},
// ];

const StudentDashboard = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [rooms, setRooms] = useState([]);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  
  const [bookings, setBookings] = useState([]);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });

  // Fetch bookings on page load
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // 1. Fetch both bookings and rooms in parallel
        const [bookingRes, roomsRes] = await Promise.all([
          getMyBookings(),
          getAllRooms()
        ]);
        console.log("Rooms from DB:", roomsRes.data.data);
        // 2. Update state based on your controller's response structure
        // Your booking controller returns { bookings: [...] }
        setBookings(bookingRes.data.bookings);

        // Your room controller returns { success: true, data: [...] }
        setRooms(roomsRes.data.data); 

      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };

    loadDashboardData();
  }, []);

  // Check Availability
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
      console.error(err);
      setStatusMessage({ text: "Server error while checking availability", type: "error" });
    }
  };

  // Confirm Booking
  const handleBooking = async () => {
    setStatusMessage({ text: "", type: "" });
    if (!availabilityChecked) {
      setStatusMessage({ text: "Check availability first", type: "error" });
      return;
    }

    try {
      const res = await createBooking({
        room_id: selectedRoom,
        date,
        start_time: startTime,
        end_time: endTime,
        purpose: "Meeting",
      });

      setBookings((prev) => [res.data.booking, ...prev]);
      setShowPanel(false);
      setAvailabilityChecked(false);
      setStatusMessage({ text: "", type: "" });
      alert("Booking Successful! Pending approval.");

    } catch (err) {
      console.error("Full Error Object:", err);
      // Display the specific message from the backend
      const errorMsg = err.response?.data?.message || "Booking failed";
      setStatusMessage({ text: errorMsg, type: "error" }); 
    }
  };

  return (
    <div className="student-dashboard">

      {/* Header */}
      <div className="dashboard-header">
        <h2>My Bookings</h2>

        <button
          className="book-btn"
          onClick={() => { setShowPanel(true); setStatusMessage({ text: "", type: "" }); }}
        >
          + Book a Room
        </button>
      </div>

      {/* Booking List */}
      <div className="booking-list">
        {bookings.length === 0 ? (
          <p>No bookings yet</p>
        ) : (
          bookings.map((b, index) => (
            <div className="booking-card" key={index}>
              <p><strong>Purpose:</strong> {b.purpose}</p>

              <div className="booking-row">
                <span><strong>Room:</strong> {b.room_id?.name}</span>
                <span className={`status ${b.status}`}>
                  {b.status}
                </span>
              </div>

              <p><strong>Date:</strong> {b.date ? b.date.split('T')[0] : ""}</p>
              <p><strong>Time:</strong> {b.start_time} - {b.end_time}</p>
            </div>
          ))
        )}
      </div>

      {/* Booking Panel */}
      {showPanel && (
        <div className="booking-panel">

          <button
            className="close-btn"
            onClick={() => { setShowPanel(false); setStatusMessage({ text: "", type: "" }); }}
          >
            ✖
          </button>

          <h3>Book a Room</h3>

          {/* Date */}
          <label>Date</label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {/* Time */}
          <label>Start Time</label>
          <input
            type="time"
            className="input"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <label>End Time</label>
          <input
            type="time"
            className="input"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />

          {/* Room Selection */}
          <label>Select Room</label>
          <div className="room-grid">
            {rooms.length === 0 ? (
              <p style={{color: "red"}}>No rooms available in database. Please add one via API.</p>
            ) : (
              rooms.map((room) => (
                <div
                  key={room._id}
                  className={`room-tile ${selectedRoom === room._id ? "active" : ""}`}
                  onClick={() => setSelectedRoom(room._id)}
                >
                  {room.name}
                </div>
              ))
            )}
          </div>

          {/* Check Availability */}
          {statusMessage.text && (
            <div style={{
              color: statusMessage.type === 'error' ? '#d32f2f' : '#2e7d32',
              marginBottom: '10px',
              textAlign: 'center',
              fontWeight: '500',
              backgroundColor: statusMessage.type === 'error' ? '#ffebee' : '#e8f5e9',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {statusMessage.text}
            </div>
          )}
          <button
            className="check-btn"
            onClick={handleCheckAvailability}
          >
            Check Availability
          </button>

          {/* Confirm Booking */}
          {availabilityChecked && (
            <button
              className="submit-btn"
              onClick={handleBooking}
            >
              Confirm Booking
            </button>
          )}

        </div>
      )}
    </div>
  );
};

export default StudentDashboard;