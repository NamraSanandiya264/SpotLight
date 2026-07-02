import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import { ToastContainer } from "react-toastify";
import Dashboard from "./pages/Dashboard/Dashboard";
import { useAuth } from "./context/AuthContext"; 
import Profile from "./pages/Profile/Profile";
import ForgotPassword from "./pages/ForgotPassword";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-container"><div>Loading...</div></div>;

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* ✅ Add the Forgot Password route here */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Dashboard Route Container */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Fallback Catch and Route Redirect to Main Core Application hub */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
