import { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaEllipsisV, FaRocket, FaChevronDown, FaChevronUp, FaCheckCircle } from "react-icons/fa";
import "./ManageEvents.css";

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

  /* Helper to check if event has finished */
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
          Swal.fire({ title: "Updated!", text: "Event modified.", icon: "success", confirmButtonColor: "#3b82f6" });
          resetForm();
          fetchEventDashboard();
        }
      } else {
        const res = await api.post("/events/create", form);
        if (res.data.success) {
          Swal.fire({ title: "Success!", text: "New event created.", icon: "success", confirmButtonColor: "#3b82f6" });
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
      confirmButtonText: "Yes, delete it"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/events/delete/${id}`);
          Swal.fire({ title: "Deleted!", text: "Event dropped.", icon: "success", confirmButtonColor: "#3b82f6" });
          fetchEventDashboard();
        } catch (err) {
          Swal.fire("Error", err.response?.data?.message || "Could not delete.", "error");
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
      confirmButtonText: "Yes, make it live!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.patch(`/events/publish/${id}`);
          Swal.fire({ title: "Live!", text: "Event broadcasted.", icon: "success", confirmButtonColor: "#3b82f6" });
          fetchEventDashboard();
        } catch (err) {
          Swal.fire("Failed", err.response?.data?.message || "Could not publish.", "error");
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
    return <div className="manage-events-loading"><h2>Loading Event Dashboard...</h2></div>;
  }

  if (!managedOrgs || managedOrgs.length === 0) {
    return (
      <div className="restricted-access-container">
        <div className="restricted-access-card">
          <h2>Access Restricted</h2>
          <p>This portal is reserved for club leadership to schedule events.</p>
        </div>
      </div>
    );

    
  }

  return (
  <div className="manage-events-container">
    <h1 className="manage-events-title">Manage Events</h1>
    <p className="manage-events-subtitle">Schedule, edit, and organize events for your clubs.</p>

    <div className="event-form-block">
      <h3 className="form-block-title">{isEditing ? "Edit Event Details" : "Create New Event"}</h3>
      {formError && <div className="form-error-alert">{formError}</div>}

      <form onSubmit={handleSubmit} className="event-form">
        <div className="event-form-columns-wrapper">
          <div className="form-column-left">
            <div className="form-field">
              <label>Event Name</label>
              <input type="text" value={form.eventName} onChange={e => setForm({...form, eventName: e.target.value})} required />
            </div>

            <div className="form-field">
              <label>Hosting Organization</label>
              <select value={form.organizationId} onChange={e => setForm({...form, organizationId: e.target.value})} disabled={isEditing}>
                {managedOrgs.map(org => <option key={org._id} value={org._id}>{org.name}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label>Contact Number</label>
              <input 
                type="text" 
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
            
            <div className="form-field dynamic-textarea-field">
              <label>Description (Optional)</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
          </div>

          <div className="form-column-right">
            <div className="form-field">
              <label>Date</label>
              <input type="date" 
               value={form.date} 
               min={todayISO}
               onChange={e => setForm({...form, date: e.target.value})} 
               required />
            </div>

            <div className="form-time-row">
              <div className="form-field">
                <label>Start Time</label>
                <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required />
              </div>
              <div className="form-field">
                <label>End Time</label>
                <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required />
              </div>
            </div>

            <div className="form-field">
              <label>Venue Location</label>
              <select 
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
              <div className="form-field" style={{ marginTop: "12px" }}>
                <label>Specify Venue Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Main Cafeteria" 
                  value={form.customVenue} 
                  onChange={e => setForm({...form, customVenue: e.target.value})} 
                  required 
                />
              </div>
            )}
          </div>
        </div>

        <div className="form-actions-row">
          <button type="submit" disabled={isSubmitting} className="btn-primary-submit">
            {isEditing ? "Save Changes" : "Create Event"}
          </button>
          {isEditing && <button type="button" onClick={resetForm} className="btn-secondary-cancel">Cancel</button>}
        </div>
      </form>
    </div>

    <div className="events-list-block">
      <h3 className="list-block-title">Your Scheduled Events ({events.length})</h3>
      {events.length > 0 ? (
        <div className="events-cards-grid-wrapper">
          {events.map(event => {
            const isPast = checkIsPast(event.date, event.endTime);

            return (
            <div key={event._id} className={`event-roster-card ${isPast ? 'is-past' : ''}`}>
              <div className="card-header-row">
                <div className="card-badge-group">
                  <span className="org-badge-tag">{event.organization?.name}</span>
                  
                  {isPast ? (
                    <span className="status-badge-tag completed">
                      {event.isPublished ? "Completed" : "Draft expired"}
                    </span>
                  ) : (
                    <span className={`status-badge-tag ${event.isPublished ? "live" : "draft"}`}>
                      {event.isPublished ? "Live on Calendar" : "Draft"}
                    </span>
                  )}

                  {event.isEdited && (
                    <span className="status-badge-tag" style={{ backgroundColor: "#e0e7ff", color: "#1e40af" }}>
                      Edited
                    </span>
                  )}
                  {event.bookingRef?.status === "pending" && !isPast && (
                    <span className="status-badge-tag" style={{ backgroundColor: "#fef08a", color: "#854d0e" }}>
                      Room Approval Pending
                    </span>
                  )}
                  {event.bookingRef?.status === "rejected" && (
                    <span className="status-badge-tag" style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}>
                      Room Rejected
                    </span>
                  )}
                </div>

                <div className="card-controls-cluster">
                  {!event.isPublished && event.bookingRef?.status !== "rejected" && !isPast && (
                    <button onClick={() => handlePublish(event._id)} className="btn-action-publish">
                      <FaRocket /> Publish
                    </button>
                  )}
                  <div className="dropdown-menu-wrapper">
                    <button className="btn-three-dots" onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === event._id ? null : event._id); }}>
                      <FaEllipsisV size={14} />
                    </button>
                    {activeMenuId === event._id && (
                      <div className="dropdown-actions-box">
                        <button onClick={() => { startEdit(event); setActiveMenuId(null); }} className="dropdown-item-btn edit">
                          <FaEdit style={{ marginRight: "6px" }}/> Edit Event
                        </button>
                        <button onClick={() => { handleDelete(event._id); setActiveMenuId(null); }} className="dropdown-item-btn delete">
                          <FaTrash style={{ marginRight: "6px" }}/> Delete Event
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-details-stack">
                <h4 className="event-name-heading">{event.eventName}</h4>
                <div className="event-metadata-list">
                  <div><strong>Venue:</strong> {event.customVenue || event.venue?.name || "TBD"}</div>
                  <div><strong>Date:</strong> {new Date(event.date).toLocaleDateString("en-GB")}</div>
                  <div><strong>Time:</strong> {event.startTime} - {event.endTime}</div>
                </div>
              </div>

              {event.description && (
                <div className="card-description-wrapper">
                  <button 
                    className="btn-toggle-desc" 
                    onClick={() => toggleDesc(event._id)}
                  >
                    {expandedDescs[event._id] ? (
                      <><FaChevronUp /> Hide Description</>
                    ) : (
                      <><FaChevronDown /> View Description</>
                    )}
                  </button>
                  
                  {expandedDescs[event._id] && (
                    <div className="card-description-box">
                      <p>{event.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )})}
        </div>
      ) : (
        <p className="no-events-fallback">No events registered yet under your leadership.</p>
      )}
    </div>
  </div>
);
};

export default ManageEvents;
