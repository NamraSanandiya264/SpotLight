import { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaEllipsisV, FaRocket, FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [managedOrgs, setManagedOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [formError, setFormError] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  
  const [expandedDescs, setExpandedDescs] = useState({});

  const [form, setForm] = useState({
    eventName: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    customVenue: "",
    organizationId: "",
    contact_number: "",
    description: ""
  });

  useEffect(() => {
    fetchEventDashboard();
  }, []);

  useEffect(() => {
    const closeDropdown = () => setActiveMenuId(null);
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, []);

  const fetchEventDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/events/deputy-view");
      
      let fetchedRooms = [];
      try {
        const roomRes = await api.get("/rooms"); 
        fetchedRooms = roomRes.data.data || [];
      } catch (roomErr) {
        console.warn("Rooms endpoint failed. Check your API route:", roomErr);
      }

      if (res.data?.success) {
        let fetchedEvents = res.data.events || [];
        const fetchedOrgs = res.data.managedOrgs || [];

        fetchedEvents = fetchedEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setEvents(fetchedEvents);
        setManagedOrgs(fetchedOrgs);
        setAvailableRooms(fetchedRooms);

        if (!isEditing) {
          setForm(prev => ({ 
            ...prev, 
            organizationId: fetchedOrgs?.[0]?._id || "",
            venue: fetchedRooms?.[0]?._id || "" 
          }));
        }
      }
    } catch (err) {
      console.error("Failed loading event controls:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkIsPast = (dateString, endTimeStr) => {
    const now = new Date();
    const eventEnd = new Date(dateString);
    if (!endTimeStr) return eventEnd < now;

    const [hours, minutes] = endTimeStr.split(":").map(Number);
    eventEnd.setHours(hours, minutes, 0, 0);
    return eventEnd < now;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.eventName.trim() || !form.date || !form.startTime || !form.endTime || !form.organizationId || !form.contact_number.trim()) {
      setFormError("All fields except description are mandatory to fill.");
      return;
    }

    if (!form.venue) {
      setFormError("Please select a Venue Location.");
      return;
    }

    if (form.venue === "other" && !form.customVenue.trim()) {
      setFormError("Please specify the custom venue name.");
      return;
    }
    const [startHours, startMinutes] = form.startTime.split(":").map(Number);
    const [endHours, endMinutes] = form.endTime.split(":").map(Number);
    if ((startHours * 60 + startMinutes) >= (endHours * 60 + endMinutes)) {
      setFormError("Invalid Timing: End Time must occur after Start Time.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing) {
        const res = await api.put(`/events/update/${currentEventId}`, form);
        if (res.data.success) {
          Swal.fire({ title: "Updated!", text: "Event modified.", icon: "success", confirmButtonColor: "#3b82f6", background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff', color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#000000' });
          resetForm();
          fetchEventDashboard();
        }
      } else {
        const res = await api.post("/events/create", form);
        if (res.data.success) {
          Swal.fire({ title: "Success!", text: "New event created.", icon: "success", confirmButtonColor: "#3b82f6", background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff', color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#000000' });
          resetForm();
          fetchEventDashboard();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Remove Event?",
      text: "This will permanently delete the event.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it",
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#000000'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/events/delete/${id}`);
          Swal.fire({ title: "Deleted!", text: "Event dropped.", icon: "success", confirmButtonColor: "#3b82f6", background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff', color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#000000' });
          fetchEventDashboard();
        } catch (err) {
          Swal.fire({ title: "Error", text: err.response?.data?.message || "Could not delete.", icon: "error", background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff', color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#000000' });
        }
      }
    });
  };

  const handlePublish = async (id) => {
    Swal.fire({
      title: "Publish Event?",
      text: "Make this live on the Campus Calendar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, make it live!",
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#000000'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.patch(`/events/publish/${id}`);
          Swal.fire({ title: "Live!", text: "Event broadcasted.", icon: "success", confirmButtonColor: "#3b82f6", background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff', color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#000000' });
          fetchEventDashboard();
        } catch (err) {
          Swal.fire({ title: "Failed", text: err.response?.data?.message || "Could not publish.", icon: "error", background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff', color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#000000' });
        }
      }
    });
  };

  const startEdit = (event) => {
    setFormError("");
    setIsEditing(true);
    setCurrentEventId(event._id);
    setForm({
      eventName: event.eventName,
      date: event.date.split("T")[0],
      startTime: event.startTime,
      endTime: event.endTime,
      venue: event.customVenue ? "other" : (event.venue?._id || event.venue || ""),
      customVenue: event.customVenue || "",
      organizationId: event.organization?._id || event.organization || "",
      contact_number: event.contact_number || "",
      description: event.description || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentEventId(null);
    setFormError(""); 
    setForm({
      eventName: "",
      date: "",
      startTime: "",
      endTime: "",
      venue: availableRooms?.[0]?._id || "",
      customVenue: "",
      organizationId: managedOrgs?.[0]?._id || "",
      contact_number: "",
      description: ""
    });
  };

  const toggleDesc = (id) => {
    setExpandedDescs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const todayISO = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!managedOrgs || managedOrgs.length === 0) {
    return (
      <div className="flex justify-center items-center p-8 min-h-[400px]">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-8 text-center max-w-md shadow-sm">
          <FaExclamationCircle className="text-red-500 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Access Restricted</h2>
          <p className="text-red-600/80 dark:text-red-400/80">This portal is reserved for club leadership to schedule events.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col transition-colors duration-300 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Manage Events</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Schedule, edit, and organize events for your clubs.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 md:p-8 mb-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
          {isEditing ? "Edit Event Details" : "Create New Event"}
        </h3>
        
        {formError && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 border border-red-100 dark:border-red-900/30 text-sm font-medium flex items-center gap-2">
            <FaExclamationCircle /> {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Event Name</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
                  value={form.eventName} 
                  onChange={e => setForm({...form, eventName: e.target.value})} 
                  required 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Hosting Organization</label>
                <select 
                  className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm disabled:opacity-60 appearance-none" 
                  value={form.organizationId} 
                  onChange={e => setForm({...form, organizationId: e.target.value})} 
                  disabled={isEditing}
                >
                  {managedOrgs.map(org => <option key={org._id} value={org._id}>{org.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contact Number</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
                  value={form.contact_number} 
                  onChange={e => {
                    const digitsOnly = e.target.value.replace(/\D/g, "");
                    setForm({...form, contact_number: digitsOnly});
                  }} 
                  maxLength="10"
                  placeholder="10-digit mobile number"
                  required 
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description (Optional)</label>
                <textarea 
                  className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm min-h-[120px] resize-y" 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                />
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date</label>
                <input 
                  type="date" 
                  className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                  value={form.date} 
                  min={todayISO}
                  onChange={e => setForm({...form, date: e.target.value})} 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Start Time</label>
                  <input 
                    type="time" 
                    className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                    value={form.startTime} 
                    onChange={e => setForm({...form, startTime: e.target.value})} 
                    required 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">End Time</label>
                  <input 
                    type="time" 
                    className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                    value={form.endTime} 
                    onChange={e => setForm({...form, endTime: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Venue Location</label>
                <select 
                  className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm appearance-none"
                  value={form.venue} 
                  onChange={e => {
                    if (e.target.value !== "other") {
                      setForm({...form, venue: e.target.value, customVenue: ""});
                    } else {
                      setForm({...form, venue: "other"});
                    }
                  }} 
                  required
                >
                  {availableRooms.map(room => <option key={room._id} value={room._id}>{room.name}</option>)}
                  <option value="other">Other (Manual Entry)</option>
                </select>
              </div>

              {form.venue === "other" && (
                <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Specify Venue Name</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                    placeholder="e.g., Main Cafeteria" 
                    value={form.customVenue} 
                    onChange={e => setForm({...form, customVenue: e.target.value})} 
                    required 
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-slate-700 mt-2">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            >
              {isSubmitting ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Save Changes" : "Create Event")}
            </button>
            {isEditing && (
              <button 
                type="button" 
                onClick={resetForm} 
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200 font-bold py-3 px-6 rounded-xl transition-colors border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          Your Scheduled Events 
          <span className="text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-0.5 rounded-full">{events.length}</span>
        </h3>
        
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map(event => {
              const isPast = checkIsPast(event.date, event.endTime);

              return (
              <div key={event._id} className={`bg-white dark:bg-slate-800 rounded-xl border ${isPast ? 'border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 opacity-70' : 'border-gray-200 dark:border-slate-700'} shadow-sm p-5 flex flex-col gap-4 relative transition-colors`}>
                <div className="flex justify-between items-start mb-2 border-b border-gray-100 dark:border-slate-700 pb-4">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded shadow-sm">
                      {event.organization?.name}
                    </span>
                    
                    {isPast ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded shadow-sm">
                        {event.isPublished ? "Completed" : "Draft expired"}
                      </span>
                    ) : (
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm ${
                        event.isPublished 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        {event.isPublished ? "Live on Calendar" : "Draft"}
                      </span>
                    )}

                    {event.isEdited && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded shadow-sm">
                        Edited
                      </span>
                    )}
                    {event.bookingRef?.status === "pending" && !isPast && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded shadow-sm">
                        Room Pending
                      </span>
                    )}
                    {event.bookingRef?.status === "rejected" && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded shadow-sm">
                        Room Rejected
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 relative">
                    {!event.isPublished && event.bookingRef?.status !== "rejected" && !isPast && (
                      <button 
                        onClick={() => handlePublish(event._id)} 
                        className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 px-2 py-1 rounded transition-colors"
                      >
                        <FaRocket /> Publish
                      </button>
                    )}
                    <div className="relative">
                      <button 
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded transition-colors" 
                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === event._id ? null : event._id); }}
                      >
                        <FaEllipsisV size={16} />
                      </button>
                      {activeMenuId === event._id && (
                        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700 py-1 z-10 animate-in fade-in zoom-in-95">
                          <button 
                            onClick={() => { startEdit(event); setActiveMenuId(null); }} 
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-750 flex items-center gap-2"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button 
                            onClick={() => { handleDelete(event._id); setActiveMenuId(null); }} 
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">{event.eventName}</h4>
                  <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <div className="flex items-start gap-2">
                      <strong className="text-gray-700 dark:text-gray-300 w-12 shrink-0">Venue:</strong> 
                      <span className="truncate">{event.customVenue || event.venue?.name || "TBD"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <strong className="text-gray-700 dark:text-gray-300 w-12 shrink-0">Date:</strong> 
                      <span>{new Date(event.date).toLocaleDateString("en-GB")}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <strong className="text-gray-700 dark:text-gray-300 w-12 shrink-0">Time:</strong> 
                      <span>{event.startTime} - {event.endTime}</span>
                    </div>
                  </div>
                </div>

                {event.description && (
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700/50">
                    <button 
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 hover:text-blue-800 dark:hover:text-blue-300 transition-colors w-full" 
                      onClick={() => toggleDesc(event._id)}
                    >
                      {expandedDescs[event._id] ? (
                        <><FaChevronUp /> Hide Description</>
                      ) : (
                        <><FaChevronDown /> View Description</>
                      )}
                    </button>
                    
                    {expandedDescs[event._id] && (
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-slate-750 p-3 rounded-lg border border-gray-100 dark:border-slate-700 animate-in fade-in">
                        <p>{event.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )})}
          </div>
        ) : (
          <div className="py-12 text-center bg-gray-50 dark:bg-slate-750 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
            <p className="text-gray-500 dark:text-gray-400">No events registered yet under your leadership.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEvents;
