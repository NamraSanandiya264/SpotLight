import { useState } from "react";
import API from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaLock, FaEnvelope } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import VerifyOTP from "../../components/auth/VerifyOTP";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyOTP, setShowVerifyOTP] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!formData.email.includes("@")) newErrors.email = "Invalid email address";
    if (!formData.password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const res = await API.post("/users/loginUser", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      login(res.data.user);
      toast.success("Login successful ✅");
      navigate("/dashboard");
    } catch (error) {
      if (error.response?.data?.code === "EMAIL_NOT_VERIFIED") {
        setVerifyEmail(error.response.data.email);
        setShowVerifyOTP(true);
        toast.info("Please verify your email to continue.");
        return;
      }
      setErrors({ general: error.response?.data?.message || "Invalid credentials" });
    } finally {
      setLoading(false);
    }
  };

  const inputBase = "w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400 dark:placeholder-slate-500";

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-xl">S</div>
            <span className="text-white font-bold text-xl">Spotlight</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">Welcome Back!</h1>
          <p className="text-blue-100 text-lg max-w-sm leading-relaxed">If you are a DAU student this is the right place to get started!</p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {["A","B","C"].map((l,i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-white/20 ring-2 ring-indigo-600 flex items-center justify-center text-white text-xs font-bold">{l}</div>
            ))}
          </div>
          <p className="text-blue-100 text-sm">Join hundreds of students managing campus life</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">S</div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">Spotlight</span>
          </div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sign in</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Enter your credentials to access your account</p>
          </div>

          {showVerifyOTP ? (
            <VerifyOTP
              email={verifyEmail}
              onSuccess={() => { toast.success("Email verified. Please login."); setShowVerifyOTP(false); }}
              onBack={() => setShowVerifyOTP(false)}
            />
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              {errors.general && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-3.5 text-sm font-medium">
                  {errors.general}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange}
                    className={`${inputBase} ${errors.email ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-600"}`} />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password"
                    className={`${inputBase} pr-12 ${errors.password ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-600"}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password}</p>}
              </div>

              <div className="flex justify-end -mt-2">
                <Link to="/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">Forgot Password?</Link>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-70">
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Don't have an account?{" "}
                <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Register here</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
