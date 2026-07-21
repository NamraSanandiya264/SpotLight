import { useState, useEffect } from "react";
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

const CoreRoomBooking = () => {
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
  const historyRequests = bookings.filter(b => b.status !== "pending");

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
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#000000',
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
        showConfirmButton: false,
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#000000',
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Action failed";
      
      Swal.fire({
        title: "Error!",
        text: errorMsg,
        icon: "error",
        confirmButtonColor: "#2563eb",
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#000000',
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
      confirmButtonText: "Yes, cancel it",
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#000000',
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await cancelBooking(id);
      setBookings((prev) => 
        prev.map((b) => (b._id === id ? { ...b, status: "canceled" } : b))
      );
      Swal.fire({
        title: "Canceled!", 
        text: "Booking successfully revoked.", 
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
    } finally {
      setLoading(false);
    }
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

  const renderAdminTable = (list) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {list.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400 italic">No requests to show.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-slate-750 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Requested At</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Organization</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Room</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-gray-700 dark:text-gray-300">
              {list.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors">
                  <td className="px-6 py-4">
                    {formatRequestedTime(b.createdAt)}
                  </td>
                  
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">{b.user_id?.name || "Unknown"}</td>
                  <td className="px-6 py-4">{b.contact_number || "N/A"}</td>
                  <td className="px-6 py-4">{b.organization && b.organization !== "None" ? b.organization : "-"}</td>
                  <td className="px-6 py-4 max-w-[200px] truncate" title={b.purpose}>{b.purpose}</td>
                  <td className="px-6 py-4 font-medium">{b.room_id?.name || "N/A"}</td>
                  <td className="px-6 py-4">{b.date ? b.date.split('T')[0] : "N/A"}</td>
                  <td className="px-6 py-4">{b.start_time} - {b.end_time}</td>
                  
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusClasses(b.status)}`}>
                        {b.status}
                      </span>
                      {b.isEdited && (
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded-full">
                          ✏️ Edited
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {b.status === "pending" && (
                        <>
                          <button 
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50" 
                            disabled={loading}
                            onClick={() => handleStatusUpdate(b._id, "approved")}
                            title="Approve"
                          >
                            <FaCheckCircle size={18} />
                          </button>
                          <button 
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50" 
                            disabled={loading}
                            onClick={() => handleStatusUpdate(b._id, "rejected")}
                            title="Reject"
                          >
                            <FaTimesCircle size={18} />
                          </button>
                        </>
                      )}
                      
                      {b.status === "approved" && isCancelable(b.createdAt) && (
                        <button 
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors text-sm font-medium disabled:opacity-50" 
                          disabled={loading}
                          onClick={() => handleCancelBooking(b._id)}
                        >
                          <FaTimesCircle /> Revoke
                        </button>
                      )}
                      
                      {(b.status === "rejected" || b.status === "canceled" || (b.status === "approved" && !isCancelable(b.createdAt))) && (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full flex flex-col transition-colors duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">SBG Core Admin Portal</h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-lg font-medium text-sm border border-blue-100 dark:border-blue-900/30">
          <span>Active Rooms: {rooms.length}</span>
        </div>
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
          <FaHistory /> History ({historyRequests.length})
        </button>
      </div>

      <div className="w-full">
        {activeTab === "pending" && (
          <div className="w-full animate-in fade-in duration-300">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">Pending Approval Requests</h3>
            {renderAdminTable(pendingRequests)}
          </div>
        )}
        {activeTab === "history" && (
          <div className="w-full animate-in fade-in duration-300">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">Booking History</h3>
            {renderAdminTable(historyRequests)}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoreRoomBooking;
