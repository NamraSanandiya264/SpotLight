import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./Auth/Register.css"; // Reusing your existing styles

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    
    setLoading(true);
    try {
      await API.post("/users/forgot-password", { email });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) return toast.error("Please fill all fields");

    setLoading(true);
    try {
      await API.post("/users/reset-password", { email, otp, newPassword });
      toast.success("Password reset successfully! Please login.");
      navigate("/login"); // Adjust to your login route path
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-right" style={{ margin: "auto" }}>
        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="register-form">
            <h2>Reset Password</h2>
            <p>Enter your email to receive a 6-digit OTP.</p>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
              />
            </div>
            
            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
            <div className="login-redirect">
              <Link to="/login">Back to Login</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="register-form">
            <h2>Enter OTP</h2>
            <p>We sent a code to {email}</p>
            
            <div className="form-group">
              <label>6-Digit OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
              />
            </div>
            
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            
            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;