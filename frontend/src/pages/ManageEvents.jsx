import { useEffect, useState } from "react";
import api from "../services/api";

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [managedOrgs, setManagedOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [formError, setFormError] = useState("");

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
          resetForm();
          fetchEventDashboard();
        }
      } else {
        const res = await api.post("/events/create", form);
        if (res.data.success) {
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

  // 🌟 Handle Event Removal Feature
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this scheduled event?")) {
      try {
        const res = await api.delete(`/events/delete/${id}`);
        if (res.data.success) {
          fetchEventDashboard();
        }
      } catch (err) {
        alert(err.response?.data?.message || "Could not delete event.");
      }
    }
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

  if (loading) return <div style={{ padding: "24px" }}><h2>Loading Event Dashboard...</h2></div>;

  if (!loading && (!managedOrgs || managedOrgs.length === 0)) {
    return (
      <div style={{ padding: "32px", textAlign: "center" }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "40px", backgroundColor: "#ffffff", maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ color: "#1f2937", marginBottom: "12px", fontWeight: "700" }}>Access Restricted</h2>
          <p style={{ color: "#6b7280", fontSize: "15px", lineHeight: "1.5" }}>
            This portal is reserved for club leadership. Only **Convenors, Deputies, and Core Committee members** can schedule or modify events.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", animation: "fadeIn 0.2s ease-out" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#111827", marginBottom: "4px" }}>Manage Events</h1>
      <p style={{ color: "#6b7280", marginBottom: "24px" }}>Schedule, edit, and organize events for your clubs.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.4fr", gap: "32px", alignItems: "start" }}>
        
        {/* Creation Form Block */}
        <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1f2937", marginBottom: "16px" }}>
            {isEditing ? "✏️ Edit Event Details" : "📅 Create New Event"}
          </h3>

          {formError && (
            <div style={{ padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "6px", color: "#991b1b", fontSize: "14px", fontWeight: "500", marginBottom: "16px" }}>
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px", color: "#374151" }}>Event Name</label>
              <input type="text" value={form.eventName} onChange={e => setForm({...form, eventName: e.target.value})} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} required />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px", color: "#374151" }}>Hosting Organization</label>
              <select value={form.organizationId} onChange={e => setForm({...form, organizationId: e.target.value})} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} disabled={isEditing}>
                {managedOrgs.map(org => <option key={org._id} value={org._id}>{org.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px", color: "#374151" }}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} required />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px", color: "#374151" }}>Start Time</label>
                <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px", color: "#374151" }}>End Time</label>
                <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} required />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px", color: "#374151" }}>Venue Location</label>
              <input type="text" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} required />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px", color: "#374151" }}>Description (Optional)</label>
              <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontFamily: "inherit" }} />
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: "10px", backgroundColor: "#3b82f6", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", opacity: isSubmitting ? 0.7 : 1 }}>
                {isEditing ? "Save Changes" : "Create Event"}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} style={{ padding: "10px", backgroundColor: "#f3f4f6", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", color: "#4b5563" }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 🌟 RESTRUCTURED: Line-by-line Clean Card View with Descriptions and Deletions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1f2937" }}>Your Scheduled Events ({events.length})</h3>
          {events.length > 0 ? (
            events.map(event => (
              <div key={event._id} style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "12px" }}>
                
                {/* Row 1: Org Tag & Action Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "4px 10px", borderRadius: "6px" }}>
                    {event.organization?.name}
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => startEdit(event)} style={{ padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "#ffffff", cursor: "pointer", fontSize: "13px", fontWeight: "500", color: "#374151", display: "flex", alignItems: "center", gap: "4px" }}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(event._id)} style={{ padding: "6px 12px", border: "1px solid #fca5a5", borderRadius: "6px", backgroundColor: "#fff5f5", cursor: "pointer", fontSize: "13px", fontWeight: "500", color: "#991b1b", display: "flex", alignItems: "center", gap: "4px" }}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                {/* Row 2: Event Name & Details Stacked Line-By-Line */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#111827" }}>{event.eventName}</h4>
                  <div style={{ fontSize: "14px", color: "#4b5563", display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
                    <div>📍 <strong>Venue:</strong> {event.venue}</div>
                    <div>📅 <strong>Date:</strong> {new Date(event.date).toLocaleDateString("en-GB")}</div>
                    <div>⏰ <strong>Time:</strong> {event.startTime} - {event.endTime}</div>
                  </div>
                </div>

                {/* Row 3: Clear Full-Width Description Box */}
                {event.description && (
                  <div style={{ marginTop: "4px", padding: "10px 14px", backgroundColor: "#f9fafb", borderRadius: "6px", borderLeft: "4px solid #d1d5db" }}>
                    <p style={{ margin: 0, fontSize: "13px", color: "#4b5563", fontStyle: "italic", whiteSpace: "pre-wrap", lineHeight: "1.4" }}>
                      {event.description}
                    </p>
                  </div>
                )}
                
              </div>
            ))
          ) : (
            <p style={{ fontStyle: "italic", color: "#9ca3af", margin: 0 }}>No events registered yet under your leadership.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default ManageEvents;