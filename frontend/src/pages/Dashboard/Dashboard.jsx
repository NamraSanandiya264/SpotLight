// src/pages/Dashboard/Dashboard.jsx
import { useState, useEffect } from "react"; 
import DashboardLayout from "./DashboardLayout";
import StudentDashboard from "./StudentDashboard";
import CoreDashboard from "./CoreDashboard";
import ManageEvents from "../ManageEvents"; 
import { useAuth } from "../../context/AuthContext"; 
import api from "../../services/api"; // 🌟 Import your api config helper

const Dashboard = () => {
  const { user } = useAuth(); 
  const [currentView, setCurrentView] = useState("dashboard"); 
  const [isCoreOrLeader, setIsCoreOrLeader] = useState(false); // 🌟 Track if they belong to any club leadership

  useEffect(() => {
    const checkClubPermissions = async () => {
      try {
        const res = await api.get("/events/deputy-view");
        if (res.data.success && res.data.managedOrgs?.length > 0) {
          setIsCoreOrLeader(true); // User is an active core/leader of at least one organization
        }
      } catch (err) {
        setIsCoreOrLeader(false);
      }
    };
    if (user) checkClubPermissions();
  }, [user]);

  if (!user) return <p>Please log in</p>;

  return (
    // 🌟 Pass isCoreOrLeader down into the layout
    <DashboardLayout 
      user={user} 
      currentView={currentView} 
      setCurrentView={setCurrentView}
      isCoreOrLeader={isCoreOrLeader} 
    >
      {({ collapsed, setCollapsed }) => (
        <>
          {currentView === "manage-events" && isCoreOrLeader ? (
            <ManageEvents />
          ) : (
            <>
              {user.role === "sbg_core" ? (
                <CoreDashboard collapsed={collapsed} setCollapsed={setCollapsed} />
              ) : (
                <StudentDashboard collapsed={collapsed} setCollapsed={setCollapsed} />
              )}
            </>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;