import React from "react";
import { useAuth } from "../../context/AuthContext";
import WelcomeBanner from "../../components/Dashboard/WelcomeBanner";
import QuickActions from "../../components/Dashboard/QuickActions";
import NeedsAttention from "../../components/Dashboard/NeedsAttention"; 
import NoticeBoard from "../../components/Dashboard/NoticeBoard"; 
import UpcomingSchedule from "../../components/Dashboard/UpcomingSchedule"; 
import DiscoverEvents from "../../components/Dashboard/DiscoverEvents"; 
import RecentActivity from "../../components/Dashboard/RecentActivity";
import SbgMetrics from "../../components/Dashboard/SbgMetrics";
import ActionQueue from "../../components/Dashboard/ActionQueue";
import "./Home.css"; 

const Home = ({ isCoreOrLeader, setActiveMenu }) => {
  const { user } = useAuth();

  if (!user) return <p>Loading dashboard...</p>;

  const isSbgCore = user.role === 'sbg_core';

  return (
    <div className="home-dashboard">
      {/* Metrics logic removed from banner */}
      <WelcomeBanner user={user} />

      <div className="dashboard-main-column">
        {isSbgCore ? (
          <>
            <SbgMetrics setActiveMenu={setActiveMenu} />
            <ActionQueue setActiveMenu={setActiveMenu} />
            <DiscoverEvents setActiveMenu={setActiveMenu} />
          </>
        ) : (
          <>
            <QuickActions isCoreOrLeader={isCoreOrLeader} setActiveMenu={setActiveMenu} />
            {isCoreOrLeader && <NeedsAttention setActiveMenu={setActiveMenu} />}
            <UpcomingSchedule />
            <DiscoverEvents setActiveMenu={setActiveMenu} />
          </>
        )}
      </div>

      <div className="dashboard-side-column">
        <NoticeBoard user={user} />
        <RecentActivity />
      </div>
    </div>
  );
};

export default Home;