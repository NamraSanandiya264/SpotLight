import { useState } from "react";
import "./Register.css";
import API from "../../services/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  
  // New states for OTP verification
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    studentID: "",
    name: "",
    email: "",
    password: "",
    yearOfStudy: "",
    branch: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!/^\d{9}$/.test(formData.studentID)) {
      newErrors.studentID = "Student ID must be exactly 9 digits";
    }
    if (!formData.email.includes("@")) {
      newErrors.email = "Invalid email address";
    }
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.yearOfStudy) {
      newErrors.yearOfStudy = "Please select year of study";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      // Step 1: Create user and trigger email
      await API.post("/users/registerUser", formData);
      toast.success("OTP sent to your email ✉️");
      setStep(2); // Move to OTP screen
    } catch (error) {
      handleBackendErrors(error);
      toast.error(error.response?.data?.message || "Registration failed ❌");
    }
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();
    try {
      // Step 2: Verify the OTP
      await API.post("/users/verify-email", { 
        email: formData.email, 
        otp 
      });
      toast.success("Registration complete! Welcome to the network ✅");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP ❌");
    }
  };

  const handleBackendErrors = (error) => {
    const backendErrors = {};
    if (error.response?.data?.errors) {
      error.response.data.errors.forEach((err) => {
        backendErrors[err.path || err.param] = err.msg;
      });
    } else if (error.response?.data?.message) {
      backendErrors.general = error.response.data.message;
    }
    setErrors(backendErrors);
  };

  return (
    <div className="register-container">
      {/* LEFT SIDE */}
      <div className="register-left">
        <div>
          <h1>Welcome!😊</h1>
          <p>If you are a DAIICT or DAU student, this is the right place to get started!</p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="register-right">
        {step === 1 ? (
          <form onSubmit={handleDetailsSubmit} className="register-form" noValidate>
            <h2>Register Yourself</h2>

            <div className="form-group">
              <label>Student ID<span className="required">*</span></label>
              <input
                type="text"
                name="studentID"
                placeholder="e.g. 202301212"
                value={formData.studentID}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, studentID: value });
                }}
                required
                maxLength='9'
              />
              {errors.studentID && (<p className="error-text">{errors.studentID}</p>)}
            </div>

            <div className="form-group">
              <label>Full Name<span className="required">*</span></label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name here"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>University Email Address <span className="required">*</span></label>
              <input
                type="email"
                name="email"
                placeholder="202301212@daiict.ac.in"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (<p className="error-text">{errors.email}</p>)}
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, phone: value });
                }}
                maxLength="10"
                required
              />
              {errors.phone && (<p className="error-text">{errors.phone}</p>)}
            </div>

            <div className="form-group">
              <label>Password <span className="required">*</span></label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {errors.password && (<p className="error-text">{errors.password}</p>)}
                <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Year of Study <span className="required">*</span></label>
              <select name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} required>
                <option value="">Select Year</option>
                <option value="B.Tech - 1st Year">B.Tech - 1st Year</option>
                <option value="B.Tech - 2nd Year">B.Tech - 2nd Year</option>
                <option value="B.Tech - 3rd Year">B.Tech - 3rd Year</option>
                <option value="B.Tech - 4th Year">B.Tech - 4th Year</option>
                <option value="Masters - 1st Year">Masters - 1st Year</option>
                <option value="Masters - 2nd Year">Masters - 2nd Year</option>
              </select>
              {errors.yearOfStudy && (<p className="error-text">{errors.yearOfStudy}</p>)}
            </div>

            <div className="form-group">
              <label>Branch <span className="required">*</span></label>
              <select name="branch" value={formData.branch} onChange={handleChange} required>
                <option value="">Select Branch</option>
                <option value="ICT">ICT</option>
                <option value="ICT-CS">ICT-CS</option>
                <option value="EVD">EVD</option>
                <option value="MNC">MNC</option>
                <option value="MSCIT">MSCIT</option>
                <option value="M.Tech">M.Tech</option>
              </select>
              {errors.branch && (<p className="error-text">{errors.branch}</p>)}
            </div>

            <button type="submit" className="signup-btn">Register</button>
            <div className="login-redirect">
              <p>Already have an account? <Link to="/login">Login here</Link></p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOTPVerify} className="register-form">
            <h2>Verify Your Email</h2>
            <p style={{marginBottom: "20px", color: "#555"}}>
              We sent a 6-digit code to <strong>{formData.email}</strong>
            </p>
            
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                style={{ letterSpacing: "5px", textAlign: "center", fontSize: "1.2rem" }}
              />
            </div>

            <button type="submit" className="signup-btn">Verify & Complete</button>
            <div className="login-redirect">
              <p style={{ cursor: "pointer", color: "#4f46e5" }} onClick={() => setStep(1)}>
                Wrong email? Go back
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;