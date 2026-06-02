import { useState, useEffect } from "react";
import "./Dashboard.css";
import {
  getBookings, 
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
  FaUser,
  FaRegFileAlt
} from "react-icons/fa";
import Swal from "sweetalert2";

const CoreDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCoreData = async () => {
      try {
        const [bookingRes, roomsRes] = await Promise.all([
          getBookings(),
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

  const pendingRequests = bookings.filter(b => b.status === "pending");
  const approvedRequests = bookings.filter(b => b.status === "approved");
  const rejectedRequests = bookings.filter(b => b.status === "rejected");

  const handleStatusUpdate = async (id, newStatus) => {
    const statusVerb = newStatus === "approved" ? "approve" : "reject";
    
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to ${statusVerb} this booking request?`,
      icon: newStatus === "approved" ? "question" : "warning",
      showCancelButton: true,
      confirmButtonColor: newStatus === "approved" ? "#10b981" : "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Yes, ${statusVerb}!`,
      cancelButtonText: "Cancel",
      background: "#ffffff"
    });

    if (!result.isConfirmed) return;
    
    setLoading(true);
    try {
      await updateBookingStatus(id, newStatus);
      
      setBookings((prev) => 
        prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
      );
      
      Swal.fire({
        title: "Success!",
        text: `Booking has been ${newStatus} successfully.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Action failed";
      
      Swal.fire({
        title: "Error!",
        text: errorMsg,
        icon: "error",
        confirmButtonColor: "#2563eb"
      });
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
            <p><FaRegFileAlt className="icon" /> <strong>Purpose:</strong> {b.purpose}</p>
            
            <div className="booking-row">
              <span><FaDoorOpen className="icon" /> <strong>Room:</strong> {b.room_id?.name || "N/A"}</span>
            </div>
            
            <p><FaCalendarAlt className="icon" /> <strong>Date:</strong> {b.date ? b.date.split('T')[0] : "N/A"}</p>
            <p><FaClock className="icon" /> <strong>Time:</strong> {b.start_time} - {b.end_time}</p>

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