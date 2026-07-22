import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Dashboard/Sidebar";
import Home from "./Home";
import Organizations from "../Organizations/Organizations";
import OrganizationDetails from "../Organizations/OrganizationDetails";
import EventCalendar from "../Events/EventCalendar";
import ManageEvents from "../Events/ManageEvents";
import StudentRoomBooking from "../Bookings/StudentRoomBooking";
import CoreRoomBooking from "../Bookings/CoreRoomBooking";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { FaBars } from "react-icons/fa";
import "./Dashboard.css"; // Imported directly here now

const Dashboard = ({ children, user: userProp }) => {
  const { user: authUser } = useAuth();
  const user = userProp || authUser;
  
  const [activeMenu, setActiveMenu] = useState("home"); 
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCoreOrLeader, setIsCoreOrLeader] = useState(false);
  
  // High-level wrapper state to handle specific club view details
  const [selectedOrgId, setSelectedOrgId] = useState(null);

  // Fetch permissions on mount
  useEffect(() => {
    const checkClubPermissions = async () => {
      try {
        const res = await api.get("/events/deputy-view");
        if (res.data.success && res.data.managedOrgs?.length > 0) {
          setIsCoreOrLeader(true);
        }
      } catch (err) {
        setIsCoreOrLeader(false);
        console.error("Failed to check club permissions:", err);
      }
    };
    if (user) checkClubPermissions();
  }, [user]);

  if (!user) return <p>Please log in</p>;

  // Safeguard view resetter when moving away from or within organizations
  const handleMenuChange = (menu) => {
    if (menu !== "organizations") setSelectedOrgId(null);
    setActiveMenu(menu);
  };

  // 🌟 Centralized rendering logic
  const renderContent = () => {
    if (children) {
      return typeof children === "function"
        ? children({ collapsed, setCollapsed, activeMenu })
        : children;
    }

    switch (activeMenu) {
      case "home":
        return <Home isCoreOrLeader={isCoreOrLeader} setActiveMenu={handleMenuChange} />;
      case "organizations":
        return !selectedOrgId ? (
          <Organizations onSelectOrg={setSelectedOrgId} />
        ) : (
          <OrganizationDetails orgId={selectedOrgId} onBack={() => setSelectedOrgId(null)} />
        );
      case "events":
        return <EventCalendar />;
      case "manage-events":
        return isCoreOrLeader ? <ManageEvents /> : <p>Unauthorized</p>;
      // Add the case string that your Sidebar uses for Room Bookings (e.g., "dashboard", "bookings")
      case "dashboard": 
      case "bookings":
      default:
        return user.role === "sbg_core" ? (
          <CoreRoomBooking collapsed={collapsed} setCollapsed={setCollapsed} />
        ) : (
          <StudentRoomBooking collapsed={collapsed} setCollapsed={setCollapsed} />
        );
    }
  };

   return (
    <div className="relative flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900 overflow-x-hidden transition-colors duration-300">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar Component */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeMenu={activeMenu}
        setActiveMenu={handleMenuChange}
        user={user}
        isCoreOrLeader={isCoreOrLeader}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      
      {/* Main Content Area */}
      <div
        className={
          collapsed
            ? "flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-w-0 h-screen transition-all duration-300 md:ml-20"
            : "flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-w-0 h-screen transition-all duration-300 md:ml-64"
        }
      >
        <div className="flex items-center md:hidden mb-4 px-4 pt-4">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200 dark:hover:bg-slate-800"
            aria-label="Open sidebar"
          >
            <FaBars size={20} />
          </button>
        </div>

        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 transition-all duration-300">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
