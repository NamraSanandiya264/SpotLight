
import DashboardLayout from "./DashboardLayout";
import StudentDashboard from "./StudentDashboard";
import CoreDashboard from "./CoreDashboard";

const Dashboard = () => {

  // TEMP user (later from backend / JWT)
  const user = {
    name: "Ishti",
    role: "student", // change to "sbg_core" to test
  };

  return (
    <DashboardLayout user={user}>
      {user.role === "sbg_core" ? (
        <CoreDashboard />
      ) : (
        <StudentDashboard />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;