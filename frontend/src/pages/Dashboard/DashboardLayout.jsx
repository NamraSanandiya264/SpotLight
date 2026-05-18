import { useState } from "react";
import Sidebar from "../../components/Dashboard/Sidebar";
import Organizations from "../../pages/Organizations";
import OrganizationDetails from "../../pages/OrganizationDetails";
import "./Dashboard.css";

const DashboardLayout = ({ children, user }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("booking");
  
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
      />
      
      {/* Main Content Area Panel Viewport */}
      <div className="main-content">

        <div className="content-area">
          {/* Conditional Layout Routing Stage */}
          {activeMenu === "organizations" ? (
            !selectedOrgId ? (
              <Organizations onSelectOrg={handleOrgViewSelection} />
            ) : (
              <OrganizationDetails orgId={selectedOrgId} onBack={() => setSelectedOrgId(null)} />
            )
          ) : (
            /* Fallback to default rendering (e.g. Booking systems / lists) passed as kids routes */
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