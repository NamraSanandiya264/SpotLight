import React from "react";
import { useAuth } from "../../context/AuthContext";
import WelcomeBanner from "../../components/Dashboard/WelcomeBanner";
import NoticeBoard from "../../components/Dashboard/NoticeBoard"; 
import ActionQueue from "../../components/Dashboard/ActionQueue"; 
import DiscoverEvents from "../../components/Dashboard/DiscoverEvents"; 
import UpcomingSchedule from "../../components/Dashboard/UpcomingSchedule"; 
import QuickActions from "../../components/Dashboard/QuickActions";
import NeedsAttention from "../../components/Dashboard/NeedsAttention"; 

const Home = ({ isCoreOrLeader, setActiveMenu }) => {
  const { user } = useAuth();

  if (!user) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  const isSbgCore = user.role === 'sbg_core';

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <WelcomeBanner user={user} />
      
      <NoticeBoard user={user} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6 min-w-0">
          {isSbgCore ? (
            <ActionQueue setActiveMenu={setActiveMenu} />
          ) : (
            <UpcomingSchedule />
          )}
          <DiscoverEvents setActiveMenu={setActiveMenu} />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 min-w-0">
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