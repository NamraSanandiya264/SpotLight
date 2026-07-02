import { useState } from "react";
import "./Register.css";
import API from "../../services/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";


const Register = () => {

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    // Student ID validation
    if (!/^\d{9}$/.test(formData.studentID)) {
      newErrors.studentID = "Student ID must be exactly 9 digits";
    }

    // Email validation
    if (!formData.email.includes("@")) {
      newErrors.email = "Invalid email address";
    }

    // Password validation
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Year validation
    if (!formData.yearOfStudy) {
      newErrors.yearOfStudy = "Please select year of study";
    }

    // If errors exist → stop API call
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear previous errors
    setErrors({});

    try {
      await API.post("/users/registerUser", formData);

      toast.success("Registration successful ✅");
      navigate("/login");

    } catch (error) {
      handleBackendErrors(error);

      toast.error(
        error.response?.data?.message || "Registration failed ❌"
      );
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


  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="register-container">

      {/* LEFT SIDE */}
      <div className="register-left">
        <div>
          <h1>Welcome!😊</h1>
          <p>If you are a DAU student, this is the right place to get started!</p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="register-right">
        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <h2>Register Yourself</h2>

          {/* student id */}
          <div className="form-group">
            <label>
              Student ID<span className="required">*</span>
            </label>
            <input
              type="text"
              name="studentID"
              placeholder="e.g. 202301212"
              value={formData.studentID}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // only digits
                setFormData({ ...formData, studentID: value });
              }}
              required
              maxlength='9'
            />
            {errors.studentID && (<p className="error-text">{errors.studentID}</p>)}
          </div>
          {/* Full Name */}
          <div className="form-group">
            <label>
              Full Name<span className="required">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name here"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label>
              DAU Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="202301212@dau.ac.in"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && (<p className="error-text">{errors.email}</p>)}
          </div>
          {/* Add Phone Field*/}
          <div className="form-group">
            <label>
              Phone Number
            </label>

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

            {errors.phone && (
              <p className="error-text">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label>
              Password <span className="required">*</span>
            </label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && (<p className="error-text">{errors.password}</p>)}

              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* Year */}
          <div className="form-group">
            <label>
              Year of Study <span className="required">*</span>
            </label>
            <select
              name="yearOfStudy"
              value={formData.yearOfStudy}
              onChange={handleChange}
              required
            >
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

          {/* Branch */}
          <div className="form-group">
            <label>
              Branch <span className="required">*</span>
            </label>

            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              required
            >
              <option value="">Select Branch</option>

              <option value="ICT">
                ICT
              </option>

              <option value="ICT-CS">
                ICT-CS
              </option>

              <option value="EVD">
                EVD
              </option>

              <option value="MNC">
                MNC
              </option>

              <option value="MSCIT">
                MSCIT
              </option>

              <option value="M.Tech">
                M.Tech
              </option>
            </select>

            {errors.branch && (
              <p className="error-text">{errors.branch}</p>
            )}
          </div>

          <button type="submit" className="signup-btn">Register</button>
          <div className="login-redirect">
            <p>
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
