import React from "react";
import { useAuth } from "../../context/AuthContext";
import WelcomeBanner from "../../components/Dashboard/WelcomeBanner";
import NoticeBoard from "../../components/Dashboard/NoticeBoard"; 
import ActionQueue from "../../components/Dashboard/ActionQueue"; 
import DiscoverEvents from "../../components/Dashboard/DiscoverEvents"; 
import UpcomingSchedule from "../../components/Dashboard/UpcomingSchedule"; 
import QuickActions from "../../components/Dashboard/QuickActions";
import NeedsAttention from "../../components/Dashboard/NeedsAttention"; 
import "./Home.css"; 

const Home = ({ isCoreOrLeader, setActiveMenu }) => {
  const { user } = useAuth();

  if (!user) return <p>Loading dashboard...</p>;
  const isSbgCore = user.role === 'sbg_core';

  return (
    <div className="home-dashboard">
      <WelcomeBanner user={user} />
      
      <NoticeBoard user={user} />

      <div className="dashboard-split">
        {/* Left Column */}
        <div className="dashboard-left">
          {isSbgCore ? (
            <ActionQueue setActiveMenu={setActiveMenu} />
          ) : (
            <UpcomingSchedule />
          )}
          <DiscoverEvents setActiveMenu={setActiveMenu} />
        </div>

        {/* Right Column */}
        <div className="dashboard-right">
          <QuickActions isCoreOrLeader={isCoreOrLeader} setActiveMenu={setActiveMenu} />
          {isCoreOrLeader && !isSbgCore && (
            <NeedsAttention setActiveMenu={setActiveMenu} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;