import { useState, useEffect } from "react";
import API from "../../services/api";
import { FaEye, FaEyeSlash, FaUser, FaIdCard, FaEnvelope, FaLock, FaPhone } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate, Link, useLocation } from "react-router-dom";
import VerifyOTP from "../../components/auth/VerifyOTP";

const Register = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    studentID: "", name: "", email: "", password: "",
    yearOfStudy: "", branch: "", phone: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!/^\d{9}$/.test(formData.studentID)) newErrors.studentID = "Student ID must be exactly 9 digits";
    if (!formData.email.includes("@")) newErrors.email = "Invalid email address";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!formData.yearOfStudy) newErrors.yearOfStudy = "Please select year of study";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});

    setLoading(true);
    try {
      await API.post("/users/registerUser", formData);
      toast.success("OTP sent to your email ✉️");
      setStep(2);
    } catch (error) {
      const backendErrors = {};
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => { backendErrors[err.path || err.param] = err.msg; });
      } else if (error.response?.data?.message) {
        backendErrors.general = error.response.data.message;
      }
      setErrors(backendErrors);
      toast.error(error.response?.data?.message || "Registration failed ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.step === 2) {
      setStep(2);
      setFormData((prev) => ({ ...prev, email: location.state.email }));
    }
  }, [location.state]);

  const inputBase = "w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400 dark:placeholder-slate-500 text-sm";
  const inputErr = (field) => errors[field] ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-600";
  const labelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-xl">S</div>
            <span className="text-white font-bold text-xl">Spotlight</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">Welcome!</h1>
          <p className="text-purple-100 text-lg max-w-sm leading-relaxed">If you are a DAIICT or DAU student, this is the right place to get started!</p>
        </div>
        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
            <p className="text-white font-semibold mb-1">One platform for everything</p>
            <p className="text-purple-100 text-sm">Events, room bookings, clubs & more — all in one place.</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">S</div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">Spotlight</span>
          </div>

          {step === 1 ? (
            <>
              <div className="mb-7">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create account</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Fill in your details to get started</p>
              </div>

              <form onSubmit={handleDetailsSubmit} className="flex flex-col gap-4" noValidate>
                {errors.general && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-3.5 text-sm font-medium">{errors.general}</div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Student ID <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FaIdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                      <input type="text" name="studentID" placeholder="202301212"
                        value={formData.studentID}
                        onChange={(e) => setFormData({ ...formData, studentID: e.target.value.replace(/\D/g, "") })}
                        maxLength="9"
                        className={`${inputBase} ${inputErr("studentID")}`} />
                    </div>
                    {errors.studentID && <p className="text-red-500 text-xs mt-1 font-medium">{errors.studentID}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                      <input type="text" name="name" placeholder="Your name"
                        value={formData.name} onChange={handleChange}
                        className={`${inputBase} ${inputErr("name")}`} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>University Email <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                    <input type="email" name="email" placeholder="202301212@daiict.ac.in"
                      value={formData.email} onChange={handleChange}
                      className={`${inputBase} ${inputErr("email")}`} />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                </div>

                <div>
                  <label className={labelClass}>Phone Number</label>
                  <div className="relative">
                    <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                    <input type="text" name="phone" placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                      maxLength="10"
                      className={`${inputBase} ${inputErr("phone")}`} />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
                </div>

                <div>
                  <label className={labelClass}>Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                    <input type={showPassword ? "text" : "password"} name="password"
                      value={formData.password} onChange={handleChange} placeholder="Min. 6 characters"
                      className={`${inputBase} pr-12 ${inputErr("password")}`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Year of Study <span className="text-red-500">*</span></label>
                    <select name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange}
                      className={`${inputBase} appearance-none ${inputErr("yearOfStudy")}`}>
                      <option value="">Select Year</option>
                      {["B.Tech - 1st Year","B.Tech - 2nd Year","B.Tech - 3rd Year","B.Tech - 4th Year","Masters - 1st Year","Masters - 2nd Year"].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    {errors.yearOfStudy && <p className="text-red-500 text-xs mt-1 font-medium">{errors.yearOfStudy}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Branch <span className="text-red-500">*</span></label>
                    <select name="branch" value={formData.branch} onChange={handleChange}
                      className={`${inputBase} appearance-none ${inputErr("branch")}`}>
                      <option value="">Select Branch</option>
                      {["ICT","ICT-CS","EVD","MNC","MSCIT","M.Tech"].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    {errors.branch && <p className="text-red-500 text-xs mt-1 font-medium">{errors.branch}</p>}
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-70 mt-2">
                  {loading ? "Creating Account..." : "Create Account"}
                </button>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Login here</Link>
                </p>
              </form>
            </>
          ) : (
            <VerifyOTP
              email={formData.email}
              onSuccess={() => { toast.success("Registration completed successfully!"); navigate("/login"); }}
              onBack={() => setStep(1)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;