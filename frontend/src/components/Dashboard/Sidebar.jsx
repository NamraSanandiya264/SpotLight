import {
  FaLayerGroup, FaWallet, FaCalendarAlt,
  FaUserCircle, FaSignOutAlt, FaChevronLeft, FaChevronRight
} from "react-icons/fa";

  const Sidebar = ({ collapsed, setCollapsed, activeMenu, setActiveMenu }) => {
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
          onClick={() => setActiveMenu("booking")}
          title="Room Booking"
        >
          <FaLayerGroup /> {!collapsed && <span>Room Booking</span>}
        </li>

        <li
          className={activeMenu === "budget" ? "active" : ""}
          onClick={() => setActiveMenu("budget")}
          title="Budget"
        >
          <FaWallet /> {!collapsed && <span>Budget</span>}
        </li>

        <li
          className={activeMenu === "events" ? "active" : ""}
          onClick={() => setActiveMenu("events")}
          title="Event Calendar"
        >
          <FaCalendarAlt /> {!collapsed && <span>Event Calendar</span>}
        </li>
      </ul>

      <div className="bottom-menu">
        <div className="menu-item" title="Profile">
          <FaUserCircle /> {!collapsed && <span>Profile</span>}
        </div>
        <div className="menu-item logout" title="Logout">
          <FaSignOutAlt /> {!collapsed && <span>Logout</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
