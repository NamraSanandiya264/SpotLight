import DashboardLayout from "./DashboardLayout";
import StudentDashboard from "./StudentDashboard";
import CoreDashboard from "./CoreDashboard";
import { useAuth } from "../../context/AuthContext"; 

const Dashboard = () => {
  const { user } = useAuth(); 

  if (!user) return <p>Please log in</p>;

  return (
    <DashboardLayout user={user}>
      {({ collapsed, setCollapsed }) => (
        <>
          {/* ✅ Automatic Switching based on database role */}
          {user.role === "sbg_core" ? (
            <CoreDashboard collapsed={collapsed} setCollapsed={setCollapsed} />
          ) : (
            <StudentDashboard collapsed={collapsed} setCollapsed={setCollapsed} />
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;