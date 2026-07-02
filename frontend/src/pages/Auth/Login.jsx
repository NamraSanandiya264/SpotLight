import { useState } from "react";
import "./Register.css";
import API from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext"; // ✅ Import the hook

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ Get the login function from context

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!formData.email.includes("@")) newErrors.email = "Invalid email address";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await API.post("/users/loginUser", formData);

      // 1. Save token for API calls
      localStorage.setItem("token", res.data.token);

      localStorage.setItem("role", res.data.user.role);
      login(res.data.user); 

      toast.success("Login successful ✅");
      navigate("/dashboard");

    } catch (error) {
      const message = error.response?.data?.message || "Invalid credentials";
      setErrors({ general: message });
    }
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <div>
          <h1>Welcome Back 😊</h1>
          <p>If you are a DAU student this is the right place to get started!</p>
        </div>
      </div>

      <div className="register-right">
        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <h2>Login to your account</h2>

          <div className="form-group">
            <label>Email <span className="required">*</span></label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label>Password <span className="required">*</span></label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          {errors.general && <p className="error-text">{errors.general}</p>}

          <div className="forgot-password-link" style={{ textAlign: "right", marginBottom: "15px" }}>
            <Link to="/forgot-password" style={{ fontSize: "14px", color: "#4f46e5", textDecoration: "none" }}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="signup-btn">Login</button>

          <div className="login-redirect">
            <p>Don't have an account? <Link to="/">Register here</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
