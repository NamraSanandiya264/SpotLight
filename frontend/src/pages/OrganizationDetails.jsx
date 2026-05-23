import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext"; 
import "./Organizations.css"; 

const OrganizationDetails = ({ orgId, onBack }) => {
  const { user } = useAuth(); 
  const [activeMenuMemberId, setActiveMenuMemberId] = useState(null);
  const [data, setData] = useState(null);
  const [pendingReqs, setPendingReqs] = useState([]); 
  const [hasPendingRequest, setHasPendingRequest] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descriptionInput, setDescriptionInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingMemberId, setUpdatingMemberId] = useState(null); 

  useEffect(() => {
    if (orgId) {
      fetchOrganizationDetails();
    }
  }, [orgId]);

  const fetchOrganizationDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/organizations/${orgId}`);
      
      if (res.data && res.data.success) {
        setData(res.data);
        setDescriptionInput(res.data.organization?.description || "");
        setHasPendingRequest(res.data.hasPendingRequest || false);
        
        const membersList = res.data.members || [];
        const membership = membersList.find(m => m.userId === user?._id);
        if (membership && ["convenor", "deputy"].includes(membership.role)) {
          fetchPendingRequests();
        }
      } else {
        setError("Could not read organization data.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load details endpoint stack.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await api.get(`/organizations/${orgId}/pending-requests`);
      if (res.data.success) setPendingReqs(res.data.requests || []);
    } catch (err) {
      console.error("Error fetching requests", err);
    }
  };

  const handleRequestJoin = async () => {
    try {
      setIsSubmitting(true);
      const res = await api.post(`/organizations/${orgId}/request-join`);
      if (res.data.success) {
        alert(res.data.message);
        setHasPendingRequest(true); 
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActionOnRequest = async (requestId, action) => {
    try {
      const res = await api.put(`/organizations/requests/${requestId}`, { action });
      if (res.data.success) {
        setPendingReqs(prev => prev.filter(req => req._id !== requestId));
        if (action === "approved") fetchOrganizationDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Action failed.");
    }
  };

  const handleSaveDescription = async () => {
    try {
      setIsSubmitting(true);
      const res = await api.put(`/organizations/${orgId}/update-profile`, { description: descriptionInput });
      if (res.data.success) {
        setData(prev => ({ ...prev, organization: { ...prev.organization, description: res.data.organization.description } }));
        setIsEditingDesc(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save profile changes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("photo", file); 
      const res = await api.put(`/organizations/${orgId}/update-profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        setData(prev => ({ ...prev, organization: { ...prev.organization, photos: res.data.organization.photos } }));
        e.target.value = null; 
      }
    } catch (err) {
      alert("Failed to upload image file from device.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (targetUserId, newRole) => {
    if (newRole === "convenor" && !window.confirm("Transfer control and demote yourself to member?")) return;
    try {
      setUpdatingMemberId(targetUserId);
      const res = await api.put(`/organizations/${orgId}/roles`, { targetUserId, newRole });
      if (res.data.success) await fetchOrganizationDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role assignment.");
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleLeaveOrganization = async () => {
    const confirmMessage = isCurrentlyConvenor 
      ? "Are you sure you want to leave this organization? Since you are the Convenor, control will automatically transfer to your Deputy or Core Committee."
      : "Are you sure you want to leave this organization?";

    if (!window.confirm(confirmMessage)) return;

    try {
      setIsSubmitting(true);
      const res = await api.post(`/organizations/${orgId}/leave`);
      if (res.data.success) {
        alert("You have successfully left the organization.");
        await fetchOrganizationDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to leave organization.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (targetUserId, targetName) => {
    if (!window.confirm(`Are you sure you want to completely remove ${targetName} from the organization?`)) {
      return;
    }
    try {
      setUpdatingMemberId(targetUserId);
      const res = await api.delete(`/organizations/${orgId}/members`, {
        data: { targetUserId }
      });
      if (res.data.success) await fetchOrganizationDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member.");
    } finally {
      setUpdatingMemberId(null);
    }
  };

  // Safe initial checks to completely guarantee no runtime template exceptions
  if (loading) return <div className="organization-page" style={{ padding: "24px" }}><h2 className="loading">Loading details...</h2></div>;
  if (error || !data || !data.organization || !data.members) {
    return (
      <div className="organization-page" style={{ padding: "24px" }}>
        <button onClick={onBack} className="filter-btn" style={{ marginBottom: "24px" }}>&larr; Back to Directory</button>
        <div className="no-results" style={{ color: "#ef4444" }}><p>{error || "Organization data could not be fetched cleanly."}</p></div>
      </div>
    );
  }

  const { organization, members } = data;
  const currentUserMembership = members ? members.find(m => m.userId === user?._id) : null;
  const isAuthorizedEditor = currentUserMembership && ["convenor", "deputy", "core"].includes(currentUserMembership.role);
  const isCurrentlyConvenor = currentUserMembership && currentUserMembership.role === "convenor";
  const isDeputyOrLeader = currentUserMembership && ["convenor", "deputy"].includes(currentUserMembership.role);

  // 🌟 Safe array declarations using logical fallbacks
  const convenors = members ? members.filter((m) => m.role === "convenor") : [];
  const deputies = members ? members.filter((m) => m.role === "deputy") : [];
  const coreMembers = members ? members.filter((m) => m.role === "core") : [];
  const generalMembers = members ? members.filter((m) => m.role === "member") : [];

  return (
    <div className="organization-page" style={{ animation: "fadeIn 0.2s ease-out" }}>
      <button onClick={onBack} className="filter-btn" style={{ marginBottom: "24px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
        &larr; Back to Directory
      </button>

      {/* Profile Card */}
      <div className="organization-card" style={{ cursor: "default", padding: "28px", width: "100%", marginBottom: "32px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <span className={`badge ${organization.type || ""}`} style={{ position: "static" }}>{organization.type}</span>
            {isAuthorizedEditor && !isEditingDesc && (
              <button 
                onClick={() => { setDescriptionInput(organization.description || ""); setIsEditingDesc(true); }} 
                className="filter-btn" 
                style={{ fontSize: "12px", padding: "4px 12px", marginLeft: "auto" }}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>
          
          <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#111827", margin: "0" }}>{organization.name}</h1>
          
          {isEditingDesc ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <textarea value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)} rows={4} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", fontFamily: "inherit" }}/>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={handleSaveDescription} disabled={isSubmitting} className="filter-btn active" style={{ padding: "6px 16px", fontSize: "13px" }}>Save</button>
                <button onClick={() => setIsEditingDesc(false)} className="filter-btn" style={{ padding: "6px 16px", fontSize: "13px" }}>Cancel</button>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: "1.6", margin: "0" }}>{organization.description || "No description provided."}</p>
          )}

          {currentUserMembership ? (
            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px", marginTop: "8px", display: "flex", justifyContent: "flex-start" }}>
              <button 
                onClick={handleLeaveOrganization} 
                disabled={isSubmitting} 
                className="filter-btn" 
                style={{ padding: "10px 24px", fontSize: "14px", color: "#dc2626", borderColor: "#fca5a5", backgroundColor: "#fff5f5" }}
              >
                {isSubmitting ? "Leaving..." : "🚪 Leave Organization"}
              </button>
            </div>
          ) : (
            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px", marginTop: "8px" }}>
              {hasPendingRequest ? (
                <button 
                  disabled={true} 
                  className="filter-btn" 
                  style={{ padding: "10px 24px", fontSize: "14px", color: "#64748b", backgroundColor: "#f1f5f9", borderColor: "#cbd5e1", cursor: "not-allowed" }}
                >
                  📩 Requested
                </button>
              ) : (
                <button 
                  onClick={handleRequestJoin} 
                  disabled={isSubmitting} 
                  className="filter-btn active" 
                  style={{ padding: "10px 24px", fontSize: "14px" }}
                >
                  {isSubmitting ? "Submitting..." : "📩 Request to Join Organization"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pending Queue Portal */}
      {isDeputyOrLeader && pendingReqs.length > 0 && (
        <div className="organization-card" style={{ padding: "24px", width: "100%", marginBottom: "32px", borderColor: "#3b82f6", backgroundColor: "#f8fafc" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1e3a8a", margin: "0 0 16px 0" }}>📥 Pending Membership Requests ({pendingReqs.length})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pendingReqs.map((req) => (
              <div key={req._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff", padding: "12px 20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div>
                  <h4 style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#111827" }}>{req.user?.name}</h4>
                  <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>{req.user?.studentID || "Student ID"}</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleActionOnRequest(req._id, "approved")} className="filter-btn active" style={{ padding: "6px 14px", fontSize: "12px", backgroundColor: "#10b981", borderColor: "#10b981" }}>Approve</button>
                  <button onClick={() => handleActionOnRequest(req._id, "rejected")} className="filter-btn" style={{ padding: "6px 14px", fontSize: "12px", color: "#ef4444", borderColor: "#fca5a5" }}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Gallery Grid */}
      <div style={{ marginBottom: "36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: 0 }}>Spotlight Photos</h3>
          {isAuthorizedEditor && (
            <div>
              <label htmlFor="device-file-picker" className="filter-btn active" style={{ padding: "8px 16px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                {isSubmitting ? "Uploading..." : "➕ Upload from Device"}
              </label>
              <input id="device-file-picker" type="file" accept="image/*" onChange={handleFileUpload} disabled={isSubmitting} style={{ display: "none" }} />
            </div>
          )}
        </div>
        {organization.photos && organization.photos.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {organization.photos.map((photoUrl, index) => (
              <div key={index} style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #e5e7eb", aspectRatio: "16/10" }}>
                <img src={photoUrl.startsWith("http") ? photoUrl : `http://localhost:5001${photoUrl}`} alt="Gallery item" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        ) : ( <p style={{ fontSize: "14px", color: "#9ca3af", fontStyle: "italic" }}>No photos uploaded yet.</p> )}
      </div>

      {/* Team Structure List */}
      <div>
        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", marginBottom: "20px", borderBottom: "1px solid #e5e7eb", paddingBottom: "10px" }}>Our Team</h3>
        
        {/* Convenors and Deputies */}
        {(convenors.length > 0 || deputies.length > 0) && (
          <div style={{ marginBottom: "32px" }}>
            <h4 className="section-label" style={{ fontSize: "12px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", marginBottom: "14px" }}>Leaders</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {convenors.map((m) => ( 
                <MemberItemCard 
                    key={m.userId} 
                    member={m} 
                    badgeColor="#FEF3C7" 
                    textColor="#92400e" 
                    label="Convenor" 
                    showActions={isCurrentlyConvenor} 
                    onRoleChange={handleRoleChange} 
                    isProcessing={updatingMemberId === m.userId}
                    onRemove={handleRemoveMember}
                    isMenuOpen={activeMenuMemberId === m.userId}
                    onToggleMenu={(isOpen) => setActiveMenuMemberId(isOpen ? m.userId : null)}
                  />
              ))}
              {deputies.map((m) => ( 
                <MemberItemCard 
                    key={m.userId} 
                    member={m} 
                    badgeColor="#e0f2fe" 
                    textColor="#0369a1" 
                    label="Deputy" 
                    showActions={isCurrentlyConvenor} 
                    onRoleChange={handleRoleChange} 
                    isProcessing={updatingMemberId === m.userId}
                    onRemove={handleRemoveMember}
                    isMenuOpen={activeMenuMemberId === m.userId}
                    onToggleMenu={(isOpen) => setActiveMenuMemberId(isOpen ? m.userId : null)}
                /> 
              ))}
            </div>
          </div>
        )}

        {/* Core Committee */}
        {coreMembers.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <h4 className="section-label" style={{ fontSize: "12px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", marginBottom: "14px" }}>Core Members({coreMembers.length})</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {coreMembers.map((m) => ( 
                <MemberItemCard 
                    key={m.userId} 
                    member={m} 
                    badgeColor="#f3e8ff" 
                    textColor="#6b21a8" 
                    label="Core" 
                    showActions={isCurrentlyConvenor} 
                    onRoleChange={handleRoleChange} 
                    isProcessing={updatingMemberId === m.userId}
                    onRemove={handleRemoveMember}
                    isMenuOpen={activeMenuMemberId === m.userId}
                    onToggleMenu={(isOpen) => setActiveMenuMemberId(isOpen ? m.userId : null)}
                /> 
              ))}
            </div>
          </div>
        )}

        {/* General Members */}
        {generalMembers.length > 0 && (
          <div>
            <h4 className="section-label" style={{ fontSize: "12px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", marginBottom: "14px" }}>General Members ({generalMembers.length})</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {generalMembers.map((m) => ( 
                <MemberItemCard 
                    key={m.userId} 
                    member={m} 
                    badgeColor="#f3f4f6" 
                    textColor="#374151" 
                    label="Member" 
                    showActions={isCurrentlyConvenor} 
                    onRoleChange={handleRoleChange} 
                    isProcessing={updatingMemberId === m.userId}
                    onRemove={handleRemoveMember}
                    isMenuOpen={activeMenuMemberId === m.userId}
                    onToggleMenu={(isOpen) => setActiveMenuMemberId(isOpen ? m.userId : null)}
                /> 
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

//* Full horizontal-span Team Card layout with integrated mutually exclusive Management Portals */
const MemberItemCard = ({ 
  member, 
  badgeColor, 
  textColor, 
  label, 
  showActions, 
  onRoleChange, 
  isProcessing, 
  onRemove,
  isMenuOpen,     // 🌟 Received from parent
  onToggleMenu    // 🌟 Received from parent
}) => {

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeMenuGlobally = () => onToggleMenu(false);
    window.addEventListener("click", closeMenuGlobally);
    return () => window.removeEventListener("click", closeMenuGlobally);
  }, [isMenuOpen, onToggleMenu]);

  return (
    <div style={{ display: "flex", alignItems: "center", justify: "space-between", padding: "16px 24px", backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "10px", width: "100%", opacity: isProcessing ? 0.6 : 1, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", color: "#4b5563", fontSize: "16px", border: "1px solid #e5e7eb" }}>
          {member.name ? member.name.charAt(0).toUpperCase() : "U"}
        </div>
        <div>
          <h4 style={{ margin: "0 0 2px 0", fontSize: "15px", fontWeight: "600", color: "#111827" }}>{member.name}</h4>
          <p style={{ margin: "0", fontSize: "13px", color: "#6b7280" }}>{member.studentID || "Student ID"}</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>
        <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", padding: "4px 12px", borderRadius: "9999px", backgroundColor: badgeColor, color: textColor }}>{label}</span>
        
        {/* Render setting gear button ONLY if card is not the Convenor's row */}
        {showActions && member.role !== "convenor" && (
          <div className="role-action-wrapper" onClick={(e) => e.stopPropagation()}>
            <button 
              className="manage-role-trigger" 
              disabled={isProcessing} 
              onClick={() => onToggleMenu(!isMenuOpen)} // 🌟 Toggles through parent state bounds
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "16px", height: "16px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            {isMenuOpen && ( // 🌟 Evaluates the single variable flag
              <div className="role-dropdown-portal">
                {["convenor", "deputy", "core", "member"].map((r) => (
                  <button key={r} className={`role-option-item ${member.role === r ? "active" : ""}`} onClick={() => { onRoleChange(member.userId, r); onToggleMenu(false); }}>
                    {r === "core" ? "Core Member" : r === "member" ? "General Member" : r.charAt(0).toUpperCase() + r.slice(1)}
                    {member.role === r && <div className="active-dot" />}
                  </button>
                ))}
                
                <button 
                  className="role-option-item" 
                  style={{ borderTop: "1px solid #f1f5f9", marginTop: "4px", color: "#dc2626" }}
                  onClick={() => { onRemove(member.userId, member.name); onToggleMenu(false); }}
                >
                  Kick Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationDetails;