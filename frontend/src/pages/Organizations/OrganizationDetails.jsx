import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext"; 
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
  const [nameInput, setNameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingMemberId, setUpdatingMemberId] = useState(null);
  const [activePhotoMenu, setActivePhotoMenu] = useState(null); 

  useEffect(() => {
    if (activePhotoMenu === null) return;
    const closePhotoMenuGlobally = () => setActivePhotoMenu(null);
    window.addEventListener("click", closePhotoMenuGlobally);
    return () => window.removeEventListener("click", closePhotoMenuGlobally);
  }, [activePhotoMenu]);

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
        setNameInput(res.data.organization?.name || "");
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

  // ✅ Renamed this to match your button's onClick handler
  const handleSaveProfile = async () => {
    try {
      setIsSubmitting(true);
      const res = await api.put(`/organizations/${orgId}/update-profile`, { description: descriptionInput , name : nameInput });
      if (res.data.success) {
        setData(prev => ({ ...prev, organization: { ...prev.organization, description: res.data.organization.description , name : res.data.organization.name} }));
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

  const handleRemovePhoto = async (photoUrl) => {
    if (!window.confirm("Are you sure you want to remove this photo from the spotlight?")) return;
    try {
      setIsSubmitting(true);
      const res = await api.put(`/organizations/${orgId}/remove-photo`, { photoUrl });
      if (res.data.success) {
        setData(prev => ({ 
          ...prev, 
          organization: { 
            ...prev.organization, 
            photos: res.data.organization.photos,
            coverPhoto: res.data.organization.coverPhoto
          } 
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove photo.");
    } finally {
      setIsSubmitting(false);
      setActivePhotoMenu(null);
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
      ? "As the Convenor, you must manually assign a new Convenor through the member management system before leaving. Are you sure you want to proceed?"
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

  const handleSetCover = async (photoUrl) => {
    try {
      setIsSubmitting(true);
      const res = await api.put(`/organizations/${orgId}/cover-photo`, { photoUrl });
      if (res.data.success) {
        // Update local state to reflect the new cover photo immediately
        setData(prev => ({ ...prev, organization: { ...prev.organization, coverPhoto: res.data.organization.coverPhoto } }));
        alert("Cover photo updated successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to set cover photo.");
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

  if (loading) return <div className="organization-page page-padding"><h2 className="loading">Loading details...</h2></div>;
  if (error || !data || !data.organization || !data.members) {
    return (
      <div className="organization-page page-padding">
        <button onClick={onBack} className="filter-btn back-btn-margin">&larr; Back to Directory</button>
        <div className="no-results error-text-color"><p>{error || "Organization data could not be fetched cleanly."}</p></div>
      </div>
    );
  }

  const { organization, members } = data;
  const currentUserMembership = members ? members.find(m => m.userId === user?._id) : null;
  const isAuthorizedEditor = currentUserMembership && ["convenor", "deputy", "core"].includes(currentUserMembership.role);
  const isCurrentlyConvenor = currentUserMembership && currentUserMembership.role === "convenor";
  const isDeputyOrLeader = currentUserMembership && ["convenor", "deputy"].includes(currentUserMembership.role);

  const convenors = members ? members.filter((m) => m.role === "convenor") : [];
  const deputies = members ? members.filter((m) => m.role === "deputy") : [];
  const coreMembers = members ? members.filter((m) => m.role === "core") : [];
  const generalMembers = members ? members.filter((m) => m.role === "member") : [];

  return (
    <div className="organization-page detail-view-animate">
      <button onClick={onBack} className="filter-btn back-btn-layout">
        &larr; Back to Directory
      </button>

      {/* Profile Card */}
      <div className="organization-card detail-profile-card">
        <div className="card-column-layout">
          <div className="card-header-row">
            <span className={`badge ${organization.type || ""}`}>{organization.type}</span>
            {isAuthorizedEditor && !isEditingDesc && (
              <button 
                onClick={() => { 
                  setDescriptionInput(organization.description || "");
                  setIsEditingDesc(true); 
                  setNameInput(organization.name || "")}} 
                className="filter-btn edit-profile-btn"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>
          
          {isEditingDesc ? (
            <div className="textarea-container">
              <label>Organization Name</label>
              <input 
                type="text" 
                value={nameInput} 
                onChange={(e) => setNameInput(e.target.value)} 
                className="edit-desc-textarea" 
                style={{ marginBottom: '10px' }}
              />
              
              <label>Description</label>
              <textarea 
                value={descriptionInput} 
                onChange={(e) => setDescriptionInput(e.target.value)} 
                rows={4} 
                className="edit-desc-textarea"
              />
              <div className="action-btn-gap">
                <button onClick={handleSaveProfile} disabled={isSubmitting} className="filter-btn active small-btn-padding">Save</button>
                <button onClick={() => setIsEditingDesc(false)} className="filter-btn small-btn-padding">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="detail-title">{organization.name}</h1>
              <p className="detail-desc-text">{organization.description || "No description provided."}</p>
            </>
          )}

          {currentUserMembership ? (
            <div className="membership-action-container">
              <button 
                onClick={handleLeaveOrganization} 
                disabled={isSubmitting} 
                className="filter-btn leave-club-btn"
              >
                {isSubmitting ? "Leaving..." : "🚪 Leave Organization"}
              </button>
            </div>
          ) : (
            <div className="membership-action-container">
              {hasPendingRequest ? (
                <button disabled={true} className="filter-btn requested-btn">
                  📩 Requested
                </button>
              ) : (
                <button 
                  onClick={handleRequestJoin} 
                  disabled={isSubmitting} 
                  className="filter-btn active long-btn-padding"
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
        <div className="organization-card pending-queue-card">
          <h3 className="pending-queue-title">📥 Pending Membership Requests ({pendingReqs.length})</h3>
          <div className="card-column-gap">
            {pendingReqs.map((req) => (
              <div key={req._id} className="pending-request-item">
                <div>
                  <h4 className="applicant-name">{req.user?.name}</h4>
                  <p className="applicant-id">{req.user?.studentID || "Student ID"}</p>
                </div>
                <div className="action-btn-gap">
                  <button onClick={() => handleActionOnRequest(req._id, "approved")} className="filter-btn active approve-btn">Approve</button>
                  <button onClick={() => handleActionOnRequest(req._id, "rejected")} className="filter-btn reject-btn">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Gallery Grid */}
      <div className="gallery-section-margin">
        <div className="gallery-header-row">
          <h3 className="section-heading">Spotlight Photos</h3>
          {isAuthorizedEditor && (
            <div>
              <label htmlFor="device-file-picker" className="filter-btn active upload-lbl-btn">
                {isSubmitting ? "Uploading..." : "➕ Upload from Device"}
              </label>
              <input id="device-file-picker" type="file" accept="image/*" onChange={handleFileUpload} disabled={isSubmitting} className="hidden-file-input" />
            </div>
          )}
        </div>
        {organization.photos && organization.photos.length > 0 ? (
          <div className="gallery-grid">
            {organization.photos.map((photoUrl, index) => (
              <div key={index} className="gallery-img-frame">
                <img src={photoUrl.startsWith("http") ? photoUrl : `http://localhost:5001${photoUrl}`} alt="Gallery item" className="gallery-img" />

                {/* 3-Dot Menu Overlay */}
                {isAuthorizedEditor && (
                  <div className={`photo-controls-overlay ${activePhotoMenu === index ? 'menu-open' : ''}`}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents global click from instantly closing it
                        setActivePhotoMenu(activePhotoMenu === index ? null : index);
                      }}
                      className="kebab-btn"
                    >
                      &#8942;
                    </button>

                    {/* Dropdown Options */}
                    {activePhotoMenu === index && (
                      <div style={{ position: 'absolute', top: '38px', right: '0', background: 'white', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, width: '130px', overflow: 'hidden' }}>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleSetCover(photoUrl); 
                            setActivePhotoMenu(null); 
                          }}
                          style={{ display: 'block', width: '100%', padding: '10px', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '14px', color: '#333' }}
                        >
                          ⭐ Set Cover
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleRemovePhoto(photoUrl); 
                          }}
                          style={{ display: 'block', width: '100%', padding: '10px', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontSize: '14px' }}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : ( <p className="empty-gallery-text">No photos uploaded yet.</p> )}
      </div>

      {/* Team Structure List */}
      <div>
        <h3 className="team-section-title">Our Team</h3>
        
        {/* Convenors and Deputies */}
        {(convenors.length > 0 || deputies.length > 0) && (
          <div className="team-tier-container">
            <h4 className="section-label group-label-style">Leaders</h4>
            <div className="card-column-gap">
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
          <div className="team-tier-container">
            <h4 className="section-label group-label-style">Core Members({coreMembers.length})</h4>
            <div className="card-column-gap">
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
            <h4 className="section-label group-label-style">General Members ({generalMembers.length})</h4>
            <div className="card-column-gap">
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

const MemberItemCard = ({ 
  member, 
  badgeColor, 
  textColor, 
  label, 
  showActions, 
  onRoleChange, 
  isProcessing, 
  onRemove,
  isMenuOpen,     
  onToggleMenu    
}) => {

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeMenuGlobally = () => onToggleMenu(false);
    window.addEventListener("click", closeMenuGlobally);
    return () => window.removeEventListener("click", closeMenuGlobally);
  }, [isMenuOpen, onToggleMenu]);

  return (
    <div className={`member-item-card ${isProcessing ? "processing-fade" : ""}`}>
      <div className="member-info-block">
        <div className="member-avatar">
          {member.name ? member.name.charAt(0).toUpperCase() : "U"}
        </div>
        <div>
          <h4 className="member-card-name">{member.name}</h4>
          <p className="member-card-id">{member.studentID || "Student ID"}</p>
        </div>
      </div>
      <div className="member-action-block">
        <span style={{ backgroundColor: badgeColor, color: textColor }} className="role-tier-badge">{label}</span>
        
        {showActions && member.role !== "convenor" && (
          <div className="role-action-wrapper" onClick={(e) => e.stopPropagation()}>
            <button 
              className="manage-role-trigger" 
              disabled={isProcessing} 
              onClick={() => onToggleMenu(!isMenuOpen)} 
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="gear-icon-svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            {isMenuOpen && ( 
              <div className="role-dropdown-portal">
                {["convenor", "deputy", "core", "member"].map((r) => (
                  <button 
                    key={r} 
                    className={`role-option-item ${member.role === r ? "active" : ""}`} 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onRoleChange(member.userId, r); 
                      onToggleMenu(false); 
                    }}
                  >
                    {r === "core" ? "Core Member" : r === "member" ? "General Member" : r.charAt(0).toUpperCase() + r.slice(1)}
                    {member.role === r && <div className="active-dot" />}
                  </button>
                ))}
                
                <button 
                  className="role-option-item kick-out-option" 
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
