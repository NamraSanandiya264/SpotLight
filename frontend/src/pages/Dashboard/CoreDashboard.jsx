import { useState, useEffect } from "react";
import "./Dashboard.css";
import {
  getBookings, // This will fetch all bookings since user role is sbg_core
  updateBookingStatus,
  getAllRooms
} from "../../services/api";
import { 
  FaHourglassHalf, 
  FaCheckCircle, 
  FaTimesCircle,
  FaDoorOpen,
  FaCalendarAlt,
  FaClock,
  FaUser
} from "react-icons/fa";
import { MdOutlineNotes } from "react-icons/md"; 

const CoreDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCoreData = async () => {
      try {
        const [bookingRes, roomsRes] = await Promise.all([
          getBookings(), // Admin fetch
          getAllRooms()
        ]);
        setBookings(bookingRes.data.data || bookingRes.data.bookings || []);
        setRooms(roomsRes.data.data || []);
      } catch (err) {
        console.error("Error loading core data:", err);
      }
    };
    loadCoreData();
  }, []);

  // --- FILTERING LOGIC ---
  const pendingRequests = bookings.filter(b => b.status === "pending");
  const approvedRequests = bookings.filter(b => b.status === "approved");
  const rejectedRequests = bookings.filter(b => b.status === "rejected");

  const handleStatusUpdate = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this booking?`)) return;
    
    setLoading(true);
    try {
      const res = await updateBookingStatus(id, newStatus);
      
      // Update local state so the UI reflects the change immediately
      setBookings((prev) => 
        prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
      );
      
      alert(`Booking ${newStatus} successfully!`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Action failed";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderAdminCards = (list) => (
    <div className="booking-grid">
      {list.length === 0 ? (
        <p className="no-data">No requests to show.</p>
      ) : (
        list.map((b) => (
          <div className="booking-card admin-card" key={b._id}>
            <div className="card-header">
              <span className={`status-badge ${b.status}`}>{b.status}</span>
            </div>
            
            <p><FaUser className="icon" /> <strong>Student:</strong> {b.user_id?.name || "Unknown"}</p>
            <p><MdOutlineNotes className="icon" /> <strong>Purpose:</strong> {b.purpose}</p>
            
            <div className="booking-row">
              <span><FaDoorOpen className="icon" /> <strong>Room:</strong> {b.room_id?.name || "N/A"}</span>
            </div>
            
            <p><FaCalendarAlt className="icon" /> <strong>Date:</strong> {b.date ? b.date.split('T')[0] : "N/A"}</p>
            <p><FaClock className="icon" /> <strong>Time:</strong> {b.start_time} - {b.end_time}</p>

            {/* Admin Actions: Only show if pending */}
            {b.status === "pending" && (
              <div className="admin-actions">
                <button 
                  className="approve-btn" 
                  disabled={loading}
                  onClick={() => handleStatusUpdate(b._id, "approved")}
                >
                  <FaCheckCircle /> Approve
                </button>
                <button 
                  className="reject-btn" 
                  disabled={loading}
                  onClick={() => handleStatusUpdate(b._id, "rejected")}
                >
                  <FaTimesCircle /> Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="student-dashboard core-dashboard">
      <div className="dashboard-header">
        <h2>SBG Core Admin Portal</h2>
        <div className="stats-mini">
          <span>Active Rooms: {rooms.length}</span>
        </div>
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
          <FaCheckCircle /> Approved ({approvedRequests.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === "rejected" ? "active" : ""}`}
          onClick={() => setActiveTab("rejected")}
        >
          <FaTimesCircle /> Rejected ({rejectedRequests.length})
        </button>
      </div>

      <div className="sections-container">
        {activeTab === "pending" && (
          <div className="tab-content">
            <h3>Pending Approval Requests</h3>
            {renderAdminCards(pendingRequests)}
          </div>
        )}
        {activeTab === "approved" && (
          <div className="tab-content">
            <h3>Approved Bookings</h3>
            {renderAdminCards(approvedRequests)}
          </div>
        )}
        {activeTab === "rejected" && (
          <div className="tab-content">
            <h3>Rejected Requests</h3>
            {renderAdminCards(rejectedRequests)}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoreDashboard;