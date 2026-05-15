import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUserCircle, FaCamera } from "react-icons/fa";
import API from "../../services/api";
import DashboardLayout from "../Dashboard/DashboardLayout";
import "./Profile.css";

const YEAR_OPTIONS = [
  "B.Tech - 1st Year",
  "B.Tech - 2nd Year",
  "B.Tech - 3rd Year",
  "B.Tech - 4th Year",
  "Masters - 1st Year",
  "Masters - 2nd Year",
];

const BRANCH_OPTIONS = [
  "Computer Science & Engineering",
  "Information & Communication Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Mathematics & Computing",
  "Other",
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
      <DashboardLayout user={{ name: "...", role: "student" }}>
        {() => <div className="profile-loading">Loading profile...</div>}
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      {() => (
        <div className="profile-page">
          <h1 className="profile-title">My Profile</h1>

          {/* Header card with avatar */}
          <div className="profile-card profile-header-card">
            <div className="avatar-wrap">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="avatar-img" />
              ) : (
                <FaUserCircle className="avatar-fallback" />
              )}
              <label className="avatar-upload-btn" title="Change picture">
                <FaCamera />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
            <div>
              <h2 className="profile-name">{user?.name}</h2>
              <p className="profile-meta">{user?.email}</p>
              <p className="profile-meta">
                Student ID: <strong>{user?.studentID}</strong> ·{" "}
                <span className="role-badge">{user?.role}</span>
              </p>
            </div>
          </div>

          {/* Edit basic info */}
          <div className="profile-card">
            <h3>Basic Information</h3>
            <form onSubmit={handleSaveInfo} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    maxLength={100}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    maxLength={15}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Year of Study</label>
                  <select
                    name="yearOfStudy"
                    value={form.yearOfStudy}
                    onChange={handleChange}
                  >
                    <option value="">Select year</option>
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Branch</label>
                  <select
                    name="branch"
                    value={form.branch}
                    onChange={handleChange}
                  >
                    <option value="">Select branch</option>
                    {BRANCH_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Read-only */}
              <div className="form-row">
                <div className="form-group">
                  <label>Email (read only)</label>
                  <input value={user?.email || ""} disabled />
                </div>
                <div className="form-group">
                  <label>Student ID (read only)</label>
                  <input value={user?.studentID || ""} disabled />
                </div>
              </div>

              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Change password */}
          <div className="profile-card">
            <h3>Change Password</h3>
            <form onSubmit={handleChangePassword} className="profile-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={pwd.currentPassword}
                  onChange={handlePwdChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={pwd.newPassword}
                    onChange={handlePwdChange}
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={pwd.confirmPassword}
                    onChange={handlePwdChange}
                  />
                </div>
              </div>
              <button type="submit" className="save-btn">
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Profile;
