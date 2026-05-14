import { useState } from "react";
import Sidebar from "../../components/Dashboard/Sidebar";
import "./Dashboard.css";

const DashboardLayout = ({ children, user }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("booking");

  return (
    <div className={`dashboard-container ${collapsed ? "collapsed" : ""}`}>

      {/* Sidebar Component */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        user={user}
      />
      
      {/* Main Content */}
      <div className="main-content">

        <div className="content-area">
          {/* Pass state to child pages */}
          {typeof children === "function"
            ? children({ collapsed, setCollapsed, activeMenu })
            : children}
        </div>

      </div>

    </div>
  );
};

export default DashboardLayout;