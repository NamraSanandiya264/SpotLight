import Sidebar from "../../components/Dashboard/Sidebar";
import Header from "../../components/Dashboard/Header";
import "./Dashboard.css"; 

const DashboardLayout = ({ children, user }) => {
  return (
    <div className="dashboard-container">
        <Sidebar user={user} />

        <div className="main-content">
            <Header user={user} />

            <div className="content">
            {children}
            </div>
        </div>
    </div>
  );
};

export default DashboardLayout;