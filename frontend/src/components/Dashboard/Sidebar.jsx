import "../../pages/Dashboard/Dashboard.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Sidebar = ({ collapsed, setCollapsed, activeMenu, setActiveMenu }) => {
  return (
    <div className="sidebar">

      <div className="sidebar-header">

        {/*Toggle Button*/}
        <button
          className="toggle-btn"
          onClick={() => setCollapsed(prev => !prev)}
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>

        {/*Logo text */}
        {!collapsed && (
          <h2 className="logo">Room Booking Portal</h2>
        )}

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
        <p>Profile</p>
        <p>Logout</p>
      </div>

    </div>
  );
};

export default Sidebar;