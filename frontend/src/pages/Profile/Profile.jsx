import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUserCircle, FaCamera, FaUser, FaLock, FaIdCard } from "react-icons/fa";
import API from "../../services/api";
import Dashboard from "../Dashboard/Dashboard";

const YEAR_OPTIONS = [
  "B.Tech - 1st Year",
  "B.Tech - 2nd Year",
  "B.Tech - 3rd Year",
  "B.Tech - 4th Year",
  "Masters - 1st Year",
  "Masters - 2nd Year",
];

const BRANCH_OPTIONS = [
  "ICT",
  "ICT-CS",
  "EVD",
  "MNC",
  "MSCIT",
  "M. Tech"
];

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    yearOfStudy: "",
    branch: "",
    phone: "",
  });

  const [pwd, setPwd] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch profile
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/users/profile");
        const u = res.data.user;
        setUser(u);
        setForm({
          name: u.name || "",
          yearOfStudy: u.yearOfStudy || "",
          branch: u.branch || "",
          phone: u.phone || "",
        });
      } catch (err) {
        toast.error("Failed to load profile");
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePwdChange = (e) =>
    setPwd({ ...pwd, [e.target.name]: e.target.value });

  // Save basic info
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      const res = await API.put("/users/profile", form);
      setUser(res.data.user);
      toast.success("Profile updated ✅");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwd.newPassword.length < 6)
      return toast.error("New password must be at least 6 characters");
    if (pwd.newPassword !== pwd.confirmPassword)
      return toast.error("Passwords do not match");

    try {
      await API.put("/users/profile/password", {
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      });
      toast.success("Password changed ✅");
      setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    }
  };

  // Upload avatar
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024)
      return toast.error("Image must be under 2MB");

    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const res = await API.post("/users/profile/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.user);
      toast.success("Avatar updated ✅");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    }
  };

  if (loading) {
    return (
      <Dashboard user={{ name: "...", role: "student" }}>
        {() => (
          <div className="flex justify-center items-center h-full min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
      </Dashboard>
    );
  }

  const inputClass = "w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";
  const sectionClass = "bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 sm:p-8";

  return (
    <Dashboard user={user}>
      {() => (
        <div className="w-full flex flex-col gap-8 pb-12 transition-colors duration-300">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">My Profile</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account details and security settings</p>
          </div>

          {/* Header card with avatar */}
          <div className={sectionClass}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-4 ring-white dark:ring-slate-700 shadow-lg">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <FaUserCircle className="text-white text-6xl" />
                  )}
                </div>
                <label
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors"
                  title="Change picture"
                >
                  <FaCamera size={12} />
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>

              {/* User info */}
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2.5 py-1 rounded-md">
                    <FaIdCard size={10} /> {user?.studentID}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-2.5 py-1 rounded-md">
                    {user?.role}
                  </span>
                  {user?.branch && (
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2.5 py-1 rounded-md">
                      {user.branch}
                    </span>
                  )}
                  {user?.yearOfStudy && (
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2.5 py-1 rounded-md">
                      {user.yearOfStudy}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Edit basic info */}
          <div className={sectionClass}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <FaUser className="text-blue-600 dark:text-blue-400" size={14} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Basic Information</h3>
            </div>
            <form onSubmit={handleSaveInfo} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    maxLength={100}
                    className={inputClass}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    maxLength={15}
                    placeholder="Optional"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Year of Study</label>
                  <select
                    name="yearOfStudy"
                    value={form.yearOfStudy}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="">Select year</option>
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Branch</label>
                  <select
                    name="branch"
                    value={form.branch}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="">Select branch</option>
                    {BRANCH_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Read-only */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Email (read only)</label>
                  <input value={user?.email || ""} disabled className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Student ID (read only)</label>
                  <input value={user?.studentID || ""} disabled className={inputClass} />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Change password */}
          <div className={sectionClass}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                <FaLock className="text-purple-600 dark:text-purple-400" size={14} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
            </div>
            <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
              <div>
                <label className={labelClass}>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={pwd.currentPassword}
                  onChange={handlePwdChange}
                  className={inputClass}
                  placeholder="Enter current password"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={pwd.newPassword}
                    onChange={handlePwdChange}
                    className={inputClass}
                    placeholder="Min. 6 characters"
                  />
                </div>
                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={pwd.confirmPassword}
                    onChange={handlePwdChange}
                    className={inputClass}
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Dashboard>
  );
};

export default Profile;
