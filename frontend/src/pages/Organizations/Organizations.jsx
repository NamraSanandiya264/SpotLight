import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { FaPlus, FaSearch, FaEllipsisV, FaEdit, FaTrash } from "react-icons/fa";
import { resolveBackendAssetUrl } from "../../api/axios";

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
  const getSwalThemeOptions = () => ({
    background: document.documentElement.classList.contains("dark") ? "#1e293b" : "#ffffff",
    color: document.documentElement.classList.contains("dark") ? "#f8fafc" : "#000000",
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: document.documentElement.classList.contains("dark") ? "#94a3b8" : "#64748b",
  });

  const handleAdminUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = { ...adminFormData, numofCoreMembers: Number(adminFormData.numofCoreMembers) };
      await api.put(`/organizations/${editingOrgId}/admin`, payload);
      setShowAdminEditModal(false);
      await Swal.fire({ icon: "success", title: "Updated", text: "Organization settings updated successfully.", ...getSwalThemeOptions() });
      fetchOrganizations();
    } catch (err) {
      await Swal.fire({ icon: "error", title: "Update Failed", text: err.response?.data?.message || "Failed to update organization.", ...getSwalThemeOptions() });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🛡️ Admin Delete Handler
  const handleAdminDelete = async (orgId, orgName) => {
    const deleteConfirm = await Swal.fire({
      title: "Delete organization?",
      text: `CRITICAL WARNING: Are you sure you want to permanently delete ${orgName}? All members, photos, and data will be erased.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      ...getSwalThemeOptions()
    });
    if (!deleteConfirm.isConfirmed) return;

    try {
      setIsSubmitting(true);
      await api.delete(`/organizations/${orgId}`);
      await Swal.fire({ icon: "success", title: "Deleted", text: "Organization deleted successfully.", ...getSwalThemeOptions() });
      fetchOrganizations();
    } catch (err) {
      await Swal.fire({ icon: "error", title: "Delete Failed", text: err.response?.data?.message || "Failed to delete organization.", ...getSwalThemeOptions() });
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
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col transition-colors duration-300 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Campus Organizations</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Explore and manage campus student clubs and committees</p>
        </div>
        
        {userRole === "sbg_core" && (
          <button 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900" 
            onClick={() => setShowModal(true)}
          >
            <FaPlus /> Create Organization
          </button>
        )}
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-8">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search clubs or committees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-x-auto">
          <button onClick={() => setFilterType("all")} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${filterType === "all" ? "bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"}`}>All</button>
          <button onClick={() => setFilterType("club")} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${filterType === "club" ? "bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"}`}>Clubs</button>
          <button onClick={() => setFilterType("committee")} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${filterType === "committee" ? "bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"}`}>Committees</button>
        </div>
      </div>

      {/* Grid Layout Container */}
      {filteredOrganizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrganizations.map((org) => {
            const coverPhotoToUse = org.coverPhoto || org.photos?.[0];
            const completeImgSrc = coverPhotoToUse
              ? resolveBackendAssetUrl(coverPhotoToUse)
              : "https://placehold.co/400x250?text=Organization";

            return (
              <div
                key={org._id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group relative"
                onClick={() => onSelectOrg(org._id)}
              >
                {/* 🛡️ SBG Core 3-Dot Admin Menu */}
                {userRole === "sbg_core" && (
                  <div className="absolute top-3 right-3 z-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        setActiveAdminMenu(activeAdminMenu === org._id ? null : org._id);
                      }}
                      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 p-2 rounded-full transition-colors shadow-sm"
                    >
                      <FaEllipsisV size={14} />
                    </button>

                    {/* Dropdown Menu Options */}
                    {activeAdminMenu === org._id && (
                      <div className="absolute top-10 right-0 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg shadow-lg z-20 w-40 overflow-hidden animate-in fade-in zoom-in-95">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setAdminFormData({ name: org.name, type: org.type, numofCoreMembers: org.numofCoreMembers || null });
                            setEditingOrgId(org._id);
                            setShowAdminEditModal(true);
                            setActiveAdminMenu(null); 
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2 transition-colors"
                        >
                          <FaEdit /> Edit Settings
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleAdminDelete(org._id, org.name);
                            setActiveAdminMenu(null);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition-colors"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="h-40 overflow-hidden relative">
                  <img
                    src={completeImgSrc}
                    alt={org.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = "https://placehold.co/400x250?text=Organization"; }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm backdrop-blur-sm ${
                      org.type === 'club' 
                        ? 'bg-blue-100/90 text-blue-700 dark:bg-blue-900/70 dark:text-blue-300' 
                        : 'bg-emerald-100/90 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-300'
                    }`}>
                      {org.type}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">{org.name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                    {org.description || "No description available at the moment."}
                  </p>
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-700">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors flex items-center gap-1">
                      Explore View <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
          <p className="text-gray-500 dark:text-gray-400">No organizations found matching your search criteria.</p>
        </div>
      )}

      {/* 🚀 Create Organization Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 transform scale-100 transition-transform animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Create New Organization</h2>
            {createError && <div className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-lg text-sm font-medium mb-4">{createError}</div>}
            
            <form onSubmit={handleCreateOrganization} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Organization Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Type</label>
                <select 
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})} 
                  className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                  <option value="club">Club</option>
                  <option value="committee">Committee</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Convenor Student ID</label>
                <input 
                  type="number" 
                  required 
                  placeholder="e.g. 202301111" 
                  value={formData.convenor_student_id} 
                  onChange={(e) => setFormData({...formData, convenor_student_id: e.target.value})} 
                  className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Core Members (Including Leaders)</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  value={formData.numofCoreMembers} 
                  onChange={(e) => setFormData({...formData, numofCoreMembers: e.target.value})} 
                  className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                <textarea 
                  rows="3" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🛡️ SBG Core Admin Edit Modal */}
      {showAdminEditModal && (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in" onClick={() => setShowAdminEditModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 transform scale-100 transition-transform animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Edit Organization Settings</h2>
            <form onSubmit={handleAdminUpdate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Organization Name</label>
                <input 
                  type="text" 
                  required 
                  value={adminFormData.name} 
                  onChange={(e) => setAdminFormData({...adminFormData, name: e.target.value})} 
                  className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Type</label>
                <select 
                  value={adminFormData.type} 
                  onChange={(e) => setAdminFormData({...adminFormData, type: e.target.value})} 
                  className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                  <option value="club">Club</option>
                  <option value="committee">Committee</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Max Core Members (incl. Convenor/Deputy)</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  value={adminFormData.numofCoreMembers} 
                  onChange={(e) => setAdminFormData({...adminFormData, numofCoreMembers: e.target.value})} 
                  className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button type="button" onClick={() => setShowAdminEditModal(false)} className="px-5 py-2.5 rounded-xl font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-70">{isSubmitting ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organizations;
