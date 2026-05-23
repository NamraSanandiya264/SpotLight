import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 
import {
  FaLayerGroup, FaCalendarAlt,
  FaUserCircle, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaBuilding
} from "react-icons/fa";

import { FiPlus } from "react-icons/fi";

const Sidebar = ({ collapsed, setCollapsed, activeMenu, setActiveMenu, isCoreOrLeader }) => {
  const navigate = useNavigate();
  const { logout } = useAuth(); 

  // Direct internal view swapper without page refresh redirects
  const handleTabChange = (menuName) => {
    setActiveMenu(menuName);
    // If the user was on /profile, return them to the dashboard home workspace view
    if (window.location.pathname !== "/dashboard") {
      navigate("/dashboard");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
        {!collapsed && <h2 className="logo">Roomly</h2>}
      </div>

      <ul className="menu">
        <li
          className={activeMenu === "booking" ? "active" : ""}
          onClick={() => handleTabChange("booking")}
          title="Room Booking"
        >
          <FaBuilding /> {!collapsed && <span>Room Booking</span>}
        </li>

        <li
          className={activeMenu === "organizations" ? "active" : ""}
          onClick={() => handleTabChange("organizations")}
          title="Organizations"
        >
          <FaLayerGroup /> {!collapsed && <span>Organizations</span>}
        </li>

        <li
          className={activeMenu === "events" ? "active" : ""}
          onClick={() => handleTabChange("events")}
          title="Event Calendar"
        >
          <FaCalendarAlt /> {!collapsed && <span>Event Calendar</span>}
        </li>

        {/* 🌟 MOVED: Create Event is now perfectly nested inside the main menu beneath Event Calendar */}
        {isCoreOrLeader && (
          <li
            className={activeMenu === "manage-events" ? "active" : ""}
            onClick={() => handleTabChange("manage-events")}
            title="Create Event"
          >
            <FiPlus /> {!collapsed && <span>Create Event</span>}
          </li>
        )}
      </ul>

      <div className="bottom-menu">
        <div
          className={`menu-item ${activeMenu === "profile" ? "active" : ""}`}
          onClick={() => {
            setActiveMenu("profile");
            navigate("/profile");
          }}
          title="Profile"
        >
          <FaUserCircle /> {!collapsed && <span>Profile</span>}
        </div>
        <div className="menu-item logout" onClick={handleLogout} title="Logout">
          <FaSignOutAlt /> {!collapsed && <span>Logout</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;