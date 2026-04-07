import { useState } from "react";
import "./Register.css"; // CSS same as register page
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    // Email validation
    if (!formData.email.includes("@")) {
      newErrors.email = "Invalid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    // Stop if errors
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const res = await API.post("/users/loginUser", formData);

      // Save token
      localStorage.setItem("token", res.data.token);

      toast.success("Login successful ✅");

      navigate("/dashboard");

    } catch (error) {
        const message =
          error.response?.data?.message || "Invalid credentials";

        setErrors({
          general: message,
        });

      }
  };

  return (
    <div className="register-container">
      
      {/* LEFT SIDE (same as register) */}
      <div className="register-left">
        <div>
          <h1>Welcome Back 😊</h1>
          <p>If you are a DAU student this is the right place to get started!</p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="register-right">
        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <h2>Login to your account</h2>

          {/* Email */}
          <div className="form-group">
            <label>Email <span className="required">*</span></label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="error-text">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password <span className="required">*</span></label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
              />

              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {errors.password && (
              <p className="error-text">{errors.password}</p>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <p className="error-text">{errors.general}</p>
          )}

          {/* Submit */}
          <button type="submit" className="signup-btn">
            Login
          </button>

          {/* Redirect */}
          <div className="login-redirect">
            <p>
              Don't have an account? <Link to="/">Register here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;