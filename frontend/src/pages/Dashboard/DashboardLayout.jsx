import { useState } from "react";
import Sidebar from "../../components/Dashboard/Sidebar";
import Organizations from "../../pages/Organizations";
import OrganizationDetails from "../../pages/OrganizationDetails";
import EventCalendar from "../../pages/EventCalendar";
import Home from "../../pages/Dashboard/Home"; 
import ManageEvents from "../../pages/ManageEvents"; // 🌟 Just adding the new import
import "./Dashboard.css";

const DashboardLayout = ({ children, user ,currentView, setCurrentView, isCoreOrLeader}) => {
  const [collapsed, setCollapsed] = useState(false);
  
  // Set default active menu tab to "home" 
  const [activeMenu, setActiveMenu] = useState("home"); 
  
  // High-level wrapper state to handle specific club view details safely inside the parent template frame
  const [selectedOrgId, setSelectedOrgId] = useState(null);

  // Safeguard view resetter when moving away from or within organizations
  const handleOrgViewSelection = (id) => {
    setSelectedOrgId(id);
  };

  return (
    <div className={`dashboard-container ${collapsed ? "collapsed" : ""}`}>

      {/* Sidebar Component */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeMenu={activeMenu}
        setActiveMenu={(menu) => {
          // Reset child view states when changing sidebar selection    
          if (menu !== "organizations") setSelectedOrgId(null);
          setActiveMenu(menu);
        }}
        user={user}
        currentView={activeMenu}
        setCurrentView={setActiveMenu}
        isCoreOrLeader={isCoreOrLeader}
      />
      
      {/* Main Content Area Panel Viewport */}
      <div className="main-content">

        <div className="content-area">
          {/* Conditional Layout Routing Stage */}
          {activeMenu === "home" ? (
            <Home />
          ) : activeMenu === "organizations" ? (
            !selectedOrgId ? (
              <Organizations onSelectOrg={handleOrgViewSelection} />
            ) : (
              <OrganizationDetails orgId={selectedOrgId} onBack={() => setSelectedOrgId(null)} />
            )
          ) : activeMenu === "events" ? (
            <EventCalendar />
          ) : activeMenu === "manage-events" ? (
            <ManageEvents />
          ) : (
            typeof children === "function"
              ? children({ collapsed, setCollapsed, activeMenu })
              : children
          )}
        </div>

      </div>

    </div>
  );
};

export default DashboardLayout;