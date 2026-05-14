import DashboardLayout from "./DashboardLayout";
import StudentDashboard from "./StudentDashboard";
//import CoreDashboard from "./CoreDashboard";

const Dashboard = () => {

  // TEMP user (later from backend / JWT)
  const user = {
    name: "Ishti",
    role: "student", // or "sbg_core"
  };

  return (
    <DashboardLayout user={user}>
      {({ collapsed, setCollapsed }) => (
        <StudentDashboard
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;