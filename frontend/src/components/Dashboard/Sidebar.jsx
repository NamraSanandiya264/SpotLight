
const Sidebar = ({ user }) => {
  return (
    <div className="sidebar">
  <div>
    <h2>Dashboard</h2>
    <ul>
      <li>Room Booking</li>
       <li>Budget</li>
      <li>Event Calendar</li>
    </ul>
  </div>

  <div className="sidebar-bottom">
    <li>Profile</li>
    <li>Logout</li>
  </div>
</div>
  );
};

export default Sidebar;