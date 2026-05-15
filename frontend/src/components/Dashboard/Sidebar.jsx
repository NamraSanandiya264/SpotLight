import "../../pages/Dashboard/Dashboard.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ collapsed, setCollapsed, activeMenu, setActiveMenu }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        {/* Toggle Button */}
        <button
          className="toggle-btn"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>

        {/* Logo text */}
        {!collapsed && <h2 className="logo">Room Booking Portal</h2>}
      </div>

      <ul className="menu">
        <li
          className={activeMenu === "booking" ? "active" : ""}
          onClick={() => setActiveMenu("booking")}
        >
          Room Booking
        </li>

        <li
          className={activeMenu === "budget" ? "active" : ""}
          onClick={() => setActiveMenu("budget")}
        >
          Budget
        </li>

        <li
          className={activeMenu === "events" ? "active" : ""}
          onClick={() => setActiveMenu("events")}
        >
          Event Calendar
        </li>
      </ul>

      <div className="bottom-menu">
        <p
          className={activeMenu === "profile" ? "active" : ""}
          onClick={() => navigate("/profile")}
          style={{ cursor: "pointer" }}
        >
          Profile
        </p>
        <p onClick={handleLogout} style={{ cursor: "pointer" }}>
          Logout
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
