
const Header = ({ user }) => {
  return (
   <div className="header">
    <h2>Welcome, {user.name}</h2>
    <span>{user.role}</span>
    </div>
  );
};

export default Header;