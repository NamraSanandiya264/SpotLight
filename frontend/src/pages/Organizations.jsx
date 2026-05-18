import { useEffect, useState } from "react";
import api from "../services/api";
import "./Organizations.css";

const Organizations = ({ onSelectOrg }) => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); 

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

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (org.description && org.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesFilter = filterType === "all" || org.type === filterType;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <h2 className="loading">Loading Organizations...</h2>
      </div>
    );
  }

  return (
    <div className="organization-page">
      
      {/* Header Section */}
      <div className="organization-header">
        <div>
          <h1>Campus Organizations</h1>
          <p className="subtitle">Explore and manage campus student clubs and committees</p>
        </div>
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
            // 🌟 1. Target the first photo in the array
            const firstPhoto = org.photos?.[0];
            const backendBaseURL = "http://localhost:5001";
            
            // 🌟 2. Build the correct source path by prepending your backend port 5001
            const completeImgSrc = firstPhoto
              ? (firstPhoto.startsWith("http") ? firstPhoto : `${backendBaseURL}${firstPhoto}`)
              : "https://placehold.co/400x250?text=Organization";

            return (
              <div
                key={org._id}
                className="organization-card"
                onClick={() => onSelectOrg(org._id)}
              >
                <div className="card-image-wrapper">
                  <img
                    src={completeImgSrc}
                    alt={org.name}
                    onError={(e) => {
                      // Fallback placeholder if the file path breaks
                      e.target.src = "https://placehold.co/400x250?text=Organization";
                    }}
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
    </div>
  );
};

export default Organizations;