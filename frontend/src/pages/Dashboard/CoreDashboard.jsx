import { useState, useEffect } from "react";
import "./Dashboard.css";
import {
  getBookings, 
  updateBookingStatus,
  getAllRooms,
  cancelBooking
} from "../../services/api";
import { 
  FaHourglassHalf, 
  FaCheckCircle, 
  FaTimesCircle,
  FaHistory
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

  // 1. Group bookings into Pending and History
  const pendingRequests = bookings.filter(b => b.status === "pending");
  const historyRequests = bookings.filter(b => b.status !== "pending");

  // Helper: Format the exact booking creation time
  const formatRequestedTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper: Check if booking is less than 24 hours old
  const isCancelable = (createdAt) => {
    if (!createdAt) return false;
    const timeDiff = new Date() - new Date(createdAt);
    const hoursPassed = timeDiff / (1000 * 60 * 60);
    return hoursPassed <= 24;
  };

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

  const handleCancelBooking = async (id) => {
    const result = await Swal.fire({
      title: "Revoke Booking?",
      text: "Are you sure you want to cancel this student's approved booking?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, cancel it"
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await cancelBooking(id);
      setBookings((prev) => 
        prev.map((b) => (b._id === id ? { ...b, status: "canceled" } : b))
      );
      Swal.fire("Canceled!", "Booking successfully revoked.", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Could not cancel booking", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderAdminTable = (list) => (
    <div className="table-container">
      {list.length === 0 ? (
        <p className="no-data">No requests to show.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th className="col-requested">Requested At</th>
              <th className="col-student">Student</th>
              <th className="col-contact">Contact</th>
              <th>Organization</th>
              <th className="col-purpose">Purpose</th>
              <th className="col-room">Room</th>
              <th className="col-date">Date</th>
              <th className="col-time">Time</th>
              <th>Status</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => (
              <tr key={b._id}>
                {/* Applied col-requested and removed the restricting inline nowrap style */}
                <td className="col-requested">
                  {formatRequestedTime(b.createdAt)}
                </td>
                
                <td className="col-student"><strong>{b.user_id?.name || "Unknown"}</strong></td>
                <td className="col-contact">{b.contact_number || "N/A"}</td>
                <td>{b.organization && b.organization !== "None" ? b.organization : "-"}</td>
                
                {/* Applied col-purpose to force text wrapping */}
                <td className="col-purpose">{b.purpose}</td>
                
                <td className="col-room">{b.room_id?.name || "N/A"}</td>
                <td className="col-date">{b.date ? b.date.split('T')[0] : "N/A"}</td>
                <td className="col-time">{b.start_time} - {b.end_time}</td>
                
                <td>
                  <span className={`status-badge ${b.status}`}>{b.status}</span>
                </td>
                
                <td className="col-actions">
                  {/* Pending Actions */}
                  {b.status === "pending" && (
                    <div className="table-actions">
                      <button 
                        className="approve-btn" 
                        disabled={loading}
                        onClick={() => handleStatusUpdate(b._id, "approved")}
                        title="Approve"
                      >
                        <FaCheckCircle />
                      </button>
                      <button 
                        className="reject-btn" 
                        disabled={loading}
                        onClick={() => handleStatusUpdate(b._id, "rejected")}
                        title="Reject"
                      >
                        <FaTimesCircle />
                      </button>
                    </div>
                  )}
                  
                  {/* Revoke Action for Approved items within 24hrs */}
                  {b.status === "approved" && isCancelable(b.createdAt) && (
                    <button 
                      className="cancel-btn table-cancel-btn" 
                      disabled={loading}
                      onClick={() => handleCancelBooking(b._id)}
                    >
                      <FaTimesCircle /> Revoke
                    </button>
                  )}
                  
                  {/* Empty state placeholder for rejected/canceled or old items */}
                  {(b.status === "rejected" || b.status === "canceled" || (b.status === "approved" && !isCancelable(b.createdAt))) && (
                    <span style={{color: "var(--text-muted)", fontSize: "0.85rem"}}>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
          className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory /> History ({historyRequests.length})
        </button>
      </div>

      <div className="sections-container">
        {activeTab === "pending" && (
          <div className="tab-content">
            <h3>Pending Approval Requests</h3>
            {renderAdminTable(pendingRequests)}
          </div>
        )}
        {activeTab === "history" && (
          <div className="tab-content">
            <h3>Booking History</h3>
            {renderAdminTable(historyRequests)}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoreDashboard;