import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext"; 
import { resolveBackendAssetUrl } from "../../api/axios";
import { FaArrowLeft, FaEdit, FaSignOutAlt, FaPlus, FaCheck, FaTimes, FaEllipsisV, FaStar, FaTrash, FaCog } from "react-icons/fa";

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

  if (loading) return (
    <div className="flex justify-center items-center h-full min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error || !data || !data.organization || !data.members) {
    return (
      <div className="w-full flex flex-col pt-6 pb-12">
        <button onClick={onBack} className="self-start mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
          <FaArrowLeft /> Back to Directory
        </button>
        <div className="py-16 text-center bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-900/50">
          <p className="text-red-600 dark:text-red-400 font-medium">{error || "Organization data could not be fetched cleanly."}</p>
        </div>
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
    <div className="w-full flex flex-col transition-colors duration-300 pb-12 animate-in fade-in">
      <button onClick={onBack} className="self-start mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
        <FaArrowLeft /> Back to Directory
      </button>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm ${
              organization.type === 'club' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
            }`}>
              {organization.type}
            </span>
            {isAuthorizedEditor && !isEditingDesc && (
              <button 
                onClick={() => { 
                  setDescriptionInput(organization.description || "");
                  setIsEditingDesc(true); 
                  setNameInput(organization.name || "")}} 
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <FaEdit /> Edit Profile
              </button>
            )}
          </div>
          
          {isEditingDesc ? (
            <div className="flex flex-col gap-3 mt-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Organization Name</label>
              <input 
                type="text" 
                value={nameInput} 
                onChange={(e) => setNameInput(e.target.value)} 
                className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
              <textarea 
                value={descriptionInput} 
                onChange={(e) => setDescriptionInput(e.target.value)} 
                rows={4} 
                className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
              />
              <div className="flex gap-3 justify-end mt-2">
                <button onClick={() => setIsEditingDesc(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200 px-5 py-2.5 rounded-xl font-medium transition-colors">Cancel</button>
                <button onClick={handleSaveProfile} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70">Save</button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">{organization.name}</h1>
              <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl whitespace-pre-wrap">{organization.description || "No description provided."}</p>
            </div>
          )}

          {currentUserMembership ? (
            <div className="mt-4 pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-end">
              <button 
                onClick={handleLeaveOrganization} 
                disabled={isSubmitting} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 transition-colors"
              >
                <FaSignOutAlt /> {isSubmitting ? "Leaving..." : "Leave Organization"}
              </button>
            </div>
          ) : (
            <div className="mt-4 pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-end">
              {hasPendingRequest ? (
                <button disabled={true} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 cursor-not-allowed">
                  <FaCheck /> Requested
                </button>
              ) : (
                <button 
                  onClick={handleRequestJoin} 
                  disabled={isSubmitting} 
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
                >
                  <FaPlus /> {isSubmitting ? "Submitting..." : "Request to Join Organization"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pending Queue Portal */}
      {isDeputyOrLeader && pendingReqs.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-yellow-200 dark:border-yellow-900/50 shadow-sm p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            📥 Pending Membership Requests ({pendingReqs.length})
          </h3>
          <div className="flex flex-col gap-3">
            {pendingReqs.map((req) => (
              <div key={req._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-750/50 border border-gray-100 dark:border-slate-700">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100">{req.user?.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{req.user?.studentID || "Student ID"}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleActionOnRequest(req._id, "approved")} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-sm">
                    <FaCheck /> Approve
                  </button>
                  <button onClick={() => handleActionOnRequest(req._id, "rejected")} className="flex items-center gap-1.5 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg font-medium transition-colors text-sm">
                    <FaTimes /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Gallery Grid */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-slate-700 pb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Spotlight Photos</h3>
          {isAuthorizedEditor && (
            <div>
              <label htmlFor="device-file-picker" className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200 px-4 py-2 rounded-xl font-medium transition-colors cursor-pointer text-sm">
                <FaPlus size={12} /> {isSubmitting ? "Uploading..." : "Upload Photo"}
              </label>
              <input id="device-file-picker" type="file" accept="image/*" onChange={handleFileUpload} disabled={isSubmitting} className="hidden" />
            </div>
          )}
        </div>
        {organization.photos && organization.photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {organization.photos.map((photoUrl, index) => (
              <div key={index} className="relative aspect-video rounded-xl overflow-hidden group border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800">
                <img src={resolveBackendAssetUrl(photoUrl)} alt="Gallery item" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

                {/* 3-Dot Menu Overlay */}
                {isAuthorizedEditor && (
                  <div className={`absolute top-2 right-2 z-10 ${activePhotoMenu === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        setActivePhotoMenu(activePhotoMenu === index ? null : index);
                      }}
                      className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors backdrop-blur-sm"
                    >
                      <FaEllipsisV size={12} />
                    </button>

                    {/* Dropdown Options */}
                    {activePhotoMenu === index && (
                      <div className="absolute top-8 right-0 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg shadow-lg z-20 w-36 overflow-hidden animate-in fade-in zoom-in-95">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleSetCover(photoUrl); 
                            setActivePhotoMenu(null); 
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-750 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2 transition-colors"
                        >
                          <FaStar className="text-yellow-500" /> Set Cover
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleRemovePhoto(photoUrl); 
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition-colors"
                        >
                          <FaTrash /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : ( <p className="text-gray-500 dark:text-gray-400 text-sm italic">No photos uploaded yet.</p> )}
      </div>

      {/* Team Structure List */}
      <div>
        <div className="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-slate-700 pb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Our Team</h3>
        </div>
        
        {/* Convenors and Deputies */}
        {(convenors.length > 0 || deputies.length > 0) && (
          <div className="mb-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Leaders</h4>
            <div className="flex flex-col gap-3">
              {convenors.map((m) => ( 
                <MemberItemCard 
                    key={m.userId} 
                    member={m} 
                    badgeColor="bg-amber-100 dark:bg-amber-900/50" 
                    textColor="text-amber-800 dark:text-amber-300" 
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
                    badgeColor="bg-sky-100 dark:bg-sky-900/50" 
                    textColor="text-sky-800 dark:text-sky-300" 
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
          <div className="mb-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Core Members ({coreMembers.length})</h4>
            <div className="flex flex-col gap-3">
              {coreMembers.map((m) => ( 
                <MemberItemCard 
                    key={m.userId} 
                    member={m} 
                    badgeColor="bg-purple-100 dark:bg-purple-900/50" 
                    textColor="text-purple-800 dark:text-purple-300" 
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
          <div className="mb-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">General Members ({generalMembers.length})</h4>
            <div className="flex flex-col gap-3">
              {generalMembers.map((m) => ( 
                <MemberItemCard 
                    key={m.userId} 
                    member={m} 
                    badgeColor="bg-gray-100 dark:bg-slate-700" 
                    textColor="text-gray-700 dark:text-gray-300" 
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
    <div className={`flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-all ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="flex items-center gap-4 mb-3 sm:mb-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          {member.name ? member.name.charAt(0).toUpperCase() : "U"}
        </div>
        <div>
          <h4 className="font-bold text-gray-900 dark:text-gray-100">{member.name}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{member.studentID || "Student ID"}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${badgeColor} ${textColor}`}>{label}</span>
        
        {showActions && member.role !== "convenor" && (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button 
              disabled={isProcessing} 
              onClick={() => onToggleMenu(!isMenuOpen)} 
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors focus:outline-none"
            >
              <FaCog size={14} />
            </button>
            
            {isMenuOpen && ( 
              <div className="absolute top-10 right-0 w-48 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg shadow-lg z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 dark:border-slate-700/50 mb-1">
                  Change Role
                </div>
                {["convenor", "deputy", "core", "member"].map((r) => (
                  <button 
                    key={r} 
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${member.role === r ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-750"}`} 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onRoleChange(member.userId, r); 
                      onToggleMenu(false); 
                    }}
                  >
                    <span>{r === "core" ? "Core Member" : r === "member" ? "General Member" : r.charAt(0).toUpperCase() + r.slice(1)}</span>
                    {member.role === r && <FaCheck size={10} />}
                  </button>
                ))}
                
                <div className="border-t border-gray-100 dark:border-slate-700 mt-1 pt-1">
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition-colors" 
                    onClick={() => { onRemove(member.userId, member.name); onToggleMenu(false); }}
                  >
                    <FaTrash size={12} /> Kick Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationDetails;
