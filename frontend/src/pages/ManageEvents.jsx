import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2"; // 🌟 Imported SweetAlert
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

  const [form, setForm] = useState({
    eventName: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    organizationId: "",
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
      if (res.data.success) {
        setEvents(res.data.events || []);
        setManagedOrgs(res.data.managedOrgs || []);
        if (res.data.managedOrgs?.length > 0 && !isEditing) {
          setForm(prev => ({ ...prev, organizationId: res.data.managedOrgs[0]._id }));
        }
      }
    } catch (err) {
      console.error("Failed loading event controls:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.eventName.trim() || !form.date || !form.startTime || !form.endTime || !form.venue.trim() || !form.organizationId) {
      setFormError("All fields except description are mandatory to fill.");
      return;
    }

    const [startHours, startMinutes] = form.startTime.split(":").map(Number);
    const [endHours, endMinutes] = form.endTime.split(":").map(Number);
    const startTimeValue = startHours * 60 + startMinutes;
    const endTimeValue = endHours * 60 + endMinutes;

    if (startTimeValue >= endTimeValue) {
      setFormError("Invalid Timing: The Event End Time must occur after the scheduled Start Time.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing) {
        const res = await api.put(`/events/update/${currentEventId}`, form);
        if (res.data.success) {
          Swal.fire({
            title: "Updated!",
            text: "Event details have been modified successfully.",
            icon: "success",
            confirmButtonColor: "#3b82f6"
          });
          resetForm();
          fetchEventDashboard();
        }
      } else {
        const res = await api.post("/events/create", form);
        if (res.data.success) {
          Swal.fire({
            title: "Success!",
            text: "New event created successfully.",
            icon: "success",
            confirmButtonColor: "#3b82f6"
          });
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

  // 🌟 Refactored Delete Alert Workflow with Swal
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Remove Event?",
      text: "This will completely eliminate the event listing. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/events/delete/${id}`);
          if (res.data.success) {
            Swal.fire({
              title: "Deleted!",
              text: "The scheduled event was securely dropped.",
              icon: "success",
              confirmButtonColor: "#3b82f6"
            });
            fetchEventDashboard();
          }
        } catch (err) {
          Swal.fire({
            title: "Error",
            text: err.response?.data?.message || "Could not delete event.",
            icon: "error",
            confirmButtonColor: "#3b82f6"
          });
        }
      }
    });
  };

  // 🌟 Refactored Publish Alert Workflow with Swal
  const handlePublish = async (id) => {
    Swal.fire({
      title: "Publish Event?",
      text: "This makes the event visible to all users across the public Campus Events Timeline.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, make it live!",
      cancelButtonText: "Keep Draft"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.patch(`/events/publish/${id}`);
          if (res.data.success) {
            Swal.fire({
              title: "Live on Calendar!",
              text: "The event is now broadcasted globally.",
              icon: "success",
              confirmButtonColor: "#3b82f6"
            });
            fetchEventDashboard();
          }
        } catch (err) {
          Swal.fire({
            title: "Publish Failed",
            text: err.response?.data?.message || "Could not publish event.",
            icon: "error",
            confirmButtonColor: "#3b82f6"
          });
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
      venue: event.venue,
      organizationId: event.organization._id || event.organization,
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
      venue: "",
      organizationId: managedOrgs[0]?._id || "",
      description: ""
    });
  };

  if (loading) {
    return (
      <div className="manage-events-loading">
        <h2>Loading Event Dashboard...</h2>
      </div>
    );
  }

  if (!loading && (!managedOrgs || managedOrgs.length === 0)) {
    return (
      <div className="restricted-access-container">
        <div className="restricted-access-card">
          <h2>Access Restricted</h2>
          <p>
            This portal is reserved for club leadership. Only **Convenors, Deputies, and Core Committee members** can schedule or modify events.
          </p>
        </div>
      </div>
    );
  }

  return (
  <div className="manage-events-container">
    <h1 className="manage-events-title">Manage Events</h1>
    <p className="manage-events-subtitle">Schedule, edit, and organize events for your clubs.</p>

    {/* 🌟 FORM SECTION BLOCK */}
    <div className="event-form-block">
      <h3 className="form-block-title">
        {isEditing ? "✏️ Edit Event Details" : "📅 Create New Event"}
      </h3>

      {formError && (
        <div className="form-error-alert">
          ⚠️ {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="event-form">
        <div className="event-form-columns-wrapper">
          
          {/* Left Column */}
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

            <div className="form-field dynamic-textarea-field">
              <label>Description (Optional)</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
          </div>

          {/* Right Column */}
          <div className="form-column-right">
            <div className="form-field">
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
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
              <input type="text" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} required />
            </div>
          </div>

        </div>

        <div className="form-actions-row">
          <button type="submit" disabled={isSubmitting} className="btn-primary-submit">
            {isEditing ? "Save Changes" : "Create Event"}
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} className="btn-secondary-cancel">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>

    {/* 🌟 SCHEDULED EVENTS BLOCK (Moved completely outside form block to stack below) */}
    <div className="events-list-block">
      <h3 className="list-block-title">Your Scheduled Events ({events.length})</h3>
      {events.length > 0 ? (
        <div className="events-cards-grid-wrapper">
          {events.map(event => (
            <div key={event._id} className="event-roster-card">
              
              <div className="card-header-row">
                <div className="card-badge-group">
                  <span className="org-badge-tag">{event.organization?.name}</span>
                  <span className={`status-badge-tag ${event.isPublished ? "live" : "draft"}`}>
                    {event.isPublished ? "● Live on Calendar" : "📝 Draft"}
                  </span>
                </div>

                <div className="card-controls-cluster">
                  {!event.isPublished && (
                    <button onClick={() => handlePublish(event._id)} className="btn-action-publish">
                      🚀 Publish
                    </button>
                  )}

                  <div className="dropdown-menu-wrapper">
                    <button 
                      className="btn-three-dots"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === event._id ? null : event._id);
                      }}
                    >
                      ⋮
                    </button>

                    {activeMenuId === event._id && (
                      <div className="dropdown-actions-box">
                        <button onClick={() => { startEdit(event); setActiveMenuId(null); }} className="dropdown-item-btn edit">
                          ✏️ Edit Event
                        </button>
                        <button onClick={() => { handleDelete(event._id); setActiveMenuId(null); }} className="dropdown-item-btn delete">
                          🗑️ Delete Event
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-details-stack">
                <h4 className="event-name-heading">{event.eventName}</h4>
                <div className="event-metadata-list">
                  <div>📍 <strong>Venue:</strong> {event.venue}</div>
                  <div>📅 <strong>Date:</strong> {new Date(event.date).toLocaleDateString("en-GB")}</div>
                  <div>⏰ <strong>Time:</strong> {event.startTime} - {event.endTime}</div>
                </div>
              </div>

              {event.description && (
                <div className="card-description-box">
                  <p>{event.description}</p>
                </div>
              )}
              
            </div>
          ))}
        </div>
      ) : (
        <p className="no-events-fallback">No events registered yet under your leadership.</p>
      )}
    </div>
  </div>
);
};

export default ManageEvents;