import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 
import {
  FaLayerGroup, FaCalendarAlt,
  FaUserCircle, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaBuilding, FaHome, FaMoon, FaSun
} from "react-icons/fa";
import Swal from "sweetalert2";
import { FiPlus } from "react-icons/fi";

const Sidebar = ({ collapsed, setCollapsed, activeMenu, setActiveMenu, isCoreOrLeader, mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const { logout } = useAuth(); 
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const hasDarkClass = root.classList.contains("dark");
    setIsDarkMode(hasDarkClass);
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  };

  const handleTabChange = (menuName) => {
    setActiveMenu(menuName);
    if (window.location.pathname !== "/dashboard") {
      navigate("/dashboard");
    }
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to log out of your session?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      background: isDarkMode ? "#1e293b" : "#ffffff",
      color: isDarkMode ? "#f8fafc" : "#000000",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login");
      }
    });
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 flex h-screen flex-col bg-white/95 dark:bg-slate-900/95 border-r border-gray-100 dark:border-slate-800/80 transition-transform duration-300 shadow-sm backdrop-blur-sm overflow-hidden ${collapsed ? "w-20 px-3 items-center" : "w-64 px-4"} ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
      
      {/* Header / Logo with inline collapse on desktop when expanded */}
      <div className={`flex items-center mt-4 mb-6 ${collapsed ? "justify-center" : "justify-between gap-3 px-2"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">S</div>
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 tracking-tight">Spotlight</h2>
          </div>
        )}

        {/* Inline collapse icon for expanded desktop */}
        {!collapsed && (
          <div className="hidden md:flex items-center">
            <button
              onClick={() => setCollapsed(!collapsed)}
              title="Collapse sidebar"
              className="flex items-center gap-3 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <FaChevronLeft size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Small centered expand button shown only when collapsed (desktop) */}
      {collapsed && (
        <div className="hidden md:flex items-center mb-3">
          <button
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            className="flex items-center justify-center w-full p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <FaChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Navigation Menu */}
      <ul className="flex flex-col gap-1 w-full list-none">
        <NavItem 
          icon={<FaHome size={18} />} 
          label="Home" 
          isActive={activeMenu === "home"} 
          onClick={() => handleTabChange("home")} 
          collapsed={collapsed} 
        />
        <NavItem 
          icon={<FaBuilding size={18} />} 
          label="Room Booking" 
          isActive={activeMenu === "booking"} 
          onClick={() => handleTabChange("booking")} 
          collapsed={collapsed} 
        />
        <NavItem 
          icon={<FaLayerGroup size={18} />} 
          label="Organizations" 
          isActive={activeMenu === "organizations"} 
          onClick={() => handleTabChange("organizations")} 
          collapsed={collapsed} 
        />
        <NavItem 
          icon={<FaCalendarAlt size={18} />} 
          label="Event Calendar" 
          isActive={activeMenu === "events"} 
          onClick={() => handleTabChange("events")} 
          collapsed={collapsed} 
        />
        
            {isCoreOrLeader && (
              <NavItem 
                icon={<FiPlus size={18} />} 
                label="Manage Events" 
                isActive={activeMenu === "manage-events"} 
                onClick={() => handleTabChange("manage-events")} 
                collapsed={collapsed} 
              />
            )}
      </ul>

      {/* Bottom Menu Actions */}
      <div className="mt-auto flex flex-col gap-1.5 w-full border-t border-gray-100 dark:border-slate-800 pt-4 pb-4">
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleDarkMode}
          className={`flex items-center gap-3 p-2.5 rounded-lg font-medium text-sm transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 w-full ${collapsed ? "justify-center" : "px-3"}`}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <FaSun size={18} className="text-amber-400" /> : <FaMoon size={18} />}
          {!collapsed && <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        <NavItem 
          icon={<FaUserCircle size={18} />} 
          label="Profile" 
          isActive={activeMenu === "profile"} 
          onClick={() => {
            setActiveMenu("profile");
            navigate("/profile");
            if (mobileOpen) setMobileOpen(false);
          }} 
          collapsed={collapsed} 
        />
        
        <button 
          onClick={handleLogout}
          className={`flex items-center gap-3 p-2.5 rounded-lg font-medium text-sm transition-all duration-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 w-full ${collapsed ? "justify-center" : "px-3"}`}
          title="Logout"
        >
          <FaSignOutAlt size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

/* Reusable NavItem Component for cleaner code */
const NavItem = ({ icon, label, isActive, onClick, collapsed }) => {
  return (
    <li className="list-none">
      <button
        onClick={onClick}
        title={label}
        className={`w-full flex items-center gap-3 p-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
          collapsed ? "justify-center" : "px-3"
        } ${
          isActive 
            ? "bg-blue-50 dark:bg-indigo-500/15 text-blue-600 dark:text-indigo-300 shadow-sm" 
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200"
        }`}
      >
        <span className={`${
          isActive 
            ? "text-blue-600 dark:text-indigo-300" 
            : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
        }`}>
          {icon}
        </span>
        {!collapsed && <span>{label}</span>}
      </button>
    </li>
  );
};

export default Sidebar;