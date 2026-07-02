import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Organizations.css";
import { useAuth } from "../../context/AuthContext";

const Organizations = ({ onSelectOrg }) => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); 

  // Create Modal states
  const [showModal, setShowModal] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "club",
    convenor_student_id: "",
    description: "",
    numofCoreMembers: null
  });

  // 🛡️ SBG Core Admin States
  const [activeAdminMenu, setActiveAdminMenu] = useState(null);
  const [showAdminEditModal, setShowAdminEditModal] = useState(false);
  const [adminFormData, setAdminFormData] = useState({ name: "", type: "club", numofCoreMembers: null });
  const [editingOrgId, setEditingOrgId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth(); 
  const userRole = user?.role || "student";

  // Global click listener to close the 3-dot menu
  useEffect(() => {
    if (activeAdminMenu === null) return;
    const closeAdminMenuGlobally = () => setActiveAdminMenu(null);
    window.addEventListener("click", closeAdminMenuGlobally);
    return () => window.removeEventListener("click", closeAdminMenuGlobally);
  }, [activeAdminMenu]);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await api.get("/organizations");
      setOrganizations(res.data.organizations || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    setCreateError("");
    try {
      const payload = {
        ...formData,
        convenor_student_id: Number(formData.convenor_student_id),
        numofCoreMembers: Number(formData.numofCoreMembers)
      };
      await api.post("/organizations", payload);
      setFormData({ name: "", type: "club", convenor_student_id: "", description: "", numofCoreMembers: null });
      setShowModal(false);
      fetchOrganizations(); 
    } catch (error) {
      setCreateError(error.response?.data?.message || "Failed to create organization.");
    }
  };

  // 🛡️ Admin Update Handler
  const handleAdminUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = { ...adminFormData, numofCoreMembers: Number(adminFormData.numofCoreMembers) };
      await api.put(`/organizations/${editingOrgId}/admin`, payload);
      setShowAdminEditModal(false);
      alert("Organization settings updated successfully.");
      fetchOrganizations();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update organization.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🛡️ Admin Delete Handler
  const handleAdminDelete = async (orgId, orgName) => {
    if (!window.confirm(`CRITICAL WARNING: Are you sure you want to permanently delete ${orgName}? All members, photos, and data will be erased.`)) return;
    try {
      setIsSubmitting(true);
      await api.delete(`/organizations/${orgId}`);
      alert("Organization deleted successfully.");
      fetchOrganizations();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete organization.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (org.description && org.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterType === "all" || org.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <div className="loading-container"><h2 className="loading">Loading Organizations...</h2></div>;
  }

  return (
    <div className="organization-page">
      
      {/* Header Section */}
      <div className="organization-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Campus Organizations</h1>
          <p className="subtitle">Explore and manage campus student clubs and committees</p>
        </div>
        
        {userRole === "sbg_core" && (
          <button 
            className="create-org-btn" 
            onClick={() => setShowModal(true)}
            style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', cursor: 'pointer', border: 'none' }}
          >
            + Create Organization
          </button>
        )}
      </div>

      {/* Search and Filters Toolbar */}
      <div className="organization-toolbar">
        <div className="search-wrapper">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search clubs or committees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <button onClick={() => setFilterType("all")} className={`filter-btn ${filterType === "all" ? "active" : ""}`}>All</button>
          <button onClick={() => setFilterType("club")} className={`filter-btn ${filterType === "club" ? "active" : ""}`}>Clubs</button>
          <button onClick={() => setFilterType("committee")} className={`filter-btn ${filterType === "committee" ? "active" : ""}`}>Committees</button>
        </div>
      </div>

      {/* Grid Layout Container */}
      {filteredOrganizations.length > 0 ? (
        <div className="organization-grid">
          {filteredOrganizations.map((org) => {
            const coverPhotoToUse = org.coverPhoto || org.photos?.[0]; 
            const backendBaseURL = "http://localhost:5001";
            
            const completeImgSrc = coverPhotoToUse
              ? (coverPhotoToUse.startsWith("http") ? coverPhotoToUse : `${backendBaseURL}${coverPhotoToUse}`)
              : "https://placehold.co/400x250?text=Organization";

            return (
              <div
                key={org._id}
                className="organization-card"
                onClick={() => onSelectOrg(org._id)}
                style={{ position: 'relative' }} // ✅ Required for absolute positioning of the menu
              >
                {/* 🛡️ SBG Core 3-Dot Admin Menu */}
                {userRole === "sbg_core" && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents navigating to the detail page
                        setActiveAdminMenu(activeAdminMenu === org._id ? null : org._id);
                      }}
                      style={{ background: 'white', color: '#333', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
                    >
                      &#8942;
                    </button>

                    {/* Dropdown Menu Options */}
                    {activeAdminMenu === org._id && (
                      <div style={{ position: 'absolute', top: '40px', right: '0', background: 'white', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 20, width: '150px', overflow: 'hidden' }}>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setAdminFormData({ name: org.name, type: org.type, numofCoreMembers: org.numofCoreMembers || null });
                            setEditingOrgId(org._id);
                            setShowAdminEditModal(true);
                            setActiveAdminMenu(null); 
                          }}
                          style={{ display: 'block', width: '100%', padding: '10px', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '14px', color: '#333' }}
                        >
                          ✏️ Edit Settings
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleAdminDelete(org._id, org.name);
                            setActiveAdminMenu(null);
                          }}
                          style={{ display: 'block', width: '100%', padding: '10px', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontSize: '14px' }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="card-image-wrapper">
                  <img
                    src={completeImgSrc}
                    alt={org.name}
                    onError={(e) => { e.target.src = "https://placehold.co/400x250?text=Organization"; }}
                  />
                  <span className={`badge ${org.type}`}>
                    {org.type}
                  </span>
                </div>

                <div className="organization-info">
                  <h2>{org.name}</h2>
                  <p>
                    {org.description || "No description available at the moment."}
                  </p>
                  <div className="card-footer">
                    <span className="action-text">Explore View &rarr;</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-results">
          <p>No organizations found matching your search criteria.</p>
        </div>
      )}

      {/* 🚀 Create Organization Modal */}
      {showModal && (
        <div className="modal-overlay" style={overlayStyle}>
          <div className="modal-content" style={modalStyle}>
            <h2 style={{marginTop: 0}}>Create New Organization</h2>
            {createError && <p style={{ color: "red", marginBottom: "10px" }}>{createError}</p>}
            
            <form onSubmit={handleCreateOrganization}>
              <div style={inputGroupStyle}>
                <label>Organization Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={inputStyle} />
              </div>
              <div style={inputGroupStyle}>
                <label>Type</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} style={inputStyle}>
                  <option value="club">Club</option>
                  <option value="committee">Committee</option>
                </select>
              </div>
              <div style={inputGroupStyle}>
                <label>Convenor Student ID</label>
                <input type="number" required placeholder="e.g. 202301111" value={formData.convenor_student_id} onChange={(e) => setFormData({...formData, convenor_student_id: e.target.value})} style={inputStyle} />
              </div>
              <div style={inputGroupStyle}>
                <label>Core Members (Including Leaders)</label>
                <input type="number" required min="1" value={formData.numofCoreMembers} onChange={(e) => setFormData({...formData, numofCoreMembers: e.target.value})} style={inputStyle} />
              </div>
              <div style={inputGroupStyle}>
                <label>Description</label>
                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={inputStyle}></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" style={submitBtnStyle}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🛡️ SBG Core Admin Edit Modal */}
      {showAdminEditModal && (
        <div className="modal-overlay" style={overlayStyle}>
          <div className="modal-content" style={modalStyle}>
            <h2 style={{marginTop: 0}}>Edit Organization Settings</h2>
            <form onSubmit={handleAdminUpdate}>
              <div style={inputGroupStyle}>
                <label>Organization Name</label>
                <input type="text" required value={adminFormData.name} onChange={(e) => setAdminFormData({...adminFormData, name: e.target.value})} style={inputStyle} />
              </div>
              <div style={inputGroupStyle}>
                <label>Type</label>
                <select value={adminFormData.type} onChange={(e) => setAdminFormData({...adminFormData, type: e.target.value})} style={inputStyle}>
                  <option value="club">Club</option>
                  <option value="committee">Committee</option>
                </select>
              </div>
              <div style={inputGroupStyle}>
                <label>Max Core Members (incl. Convenor/Deputy)</label>
                <input type="number" required min="1" value={adminFormData.numofCoreMembers} onChange={(e) => setAdminFormData({...adminFormData, numofCoreMembers: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAdminEditModal(false)} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={{ ...submitBtnStyle, backgroundColor: '#ef4444' }}>{isSubmitting ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Quick inline styles
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
const inputGroupStyle = { display: 'flex', flexDirection: 'column', marginBottom: '15px' };
const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', marginTop: '5px' };
const cancelBtnStyle = { padding: '10px 20px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#f9fafb', cursor: 'pointer' };
const submitBtnStyle = { padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: 'white', cursor: 'pointer' };

export default Organizations;
