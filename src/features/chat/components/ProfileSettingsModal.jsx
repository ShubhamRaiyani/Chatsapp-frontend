import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Check, X, Pencil } from "lucide-react";
import Avatar from "./ui/Avatar";
import AuthService from "../../auth/services/AuthService";
import { useAuth } from "../../auth/hooks/useAuth";

const ProfileSettingsModal = ({ onClose }) => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Username state
  const [usernameInput, setUsernameInput] = useState(user?.username || "");
  const [usernameStatus, setUsernameStatus] = useState("idle"); // idle | checking | available | taken | error
  const [savingUsername, setSavingUsername] = useState(false);
  const debounceRef = useRef(null);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  // Sync input if user changes externally
  useEffect(() => {
    setUsernameInput(user?.username || "");
  }, [user?.username]);

  const usernameChanged = usernameInput.trim() !== (user?.username || "").trim();

  // Debounced availability check (only when value actually changed)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const val = usernameInput.trim();

    if (!usernameChanged || val.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const available = await AuthService.checkUsername(usernameInput.trim());
        setUsernameStatus(available ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [usernameInput, usernameChanged]);

  const handleSaveUsername = async (e) => {
    e.preventDefault();
    const val = usernameInput.trim();
    if (!val) { toast.error("Username cannot be empty"); return; }
    if (val.length < 3) { toast.error("Username must be at least 3 characters"); return; }
    if (!usernameChanged) return;

    setSavingUsername(true);
    try {
      await AuthService.updateUsername(val);
      await refreshUser();
      toast.success("Username updated!");
      setUsernameStatus("idle");
    } catch (err) {
      const msg = err.message || "Failed to update username";
      toast.error(msg);
      if (msg.toLowerCase().includes("taken")) setUsernameStatus("taken");
    } finally {
      setSavingUsername(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error("New password cannot be the same as current password");
      return;
    }
    setSavingPassword(true);
    try {
      await AuthService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success("Password changed successfully");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const statusIcon = () => {
    if (!usernameChanged) return null;
    if (usernameInput.trim().length < 3) return null;
    if (usernameStatus === "checking") return <Loader2 size={15} className="animate-spin text-gray-400" />;
    if (usernameStatus === "available") return <Check size={15} className="text-emerald-400" />;
    if (usernameStatus === "taken") return <X size={15} className="text-red-400" />;
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="bg-[#1A1A1A] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#262626] overflow-hidden flex flex-col md:flex-row h-[600px] md:h-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-full md:w-60 bg-[#212121] p-5 border-b md:border-b-0 md:border-r border-[#262626] flex-shrink-0">
          <div className="flex flex-col items-center mb-6">
            <Avatar src={user?.avatar} alt={user?.username} size="lg" className="mb-3" />
            <h2 className="text-white font-semibold text-base truncate max-w-full px-2 text-center">
              {user?.username || "User"}
            </h2>
            <p className="text-gray-400 text-xs truncate max-w-full px-2">{user?.email}</p>
          </div>

          <nav className="space-y-1.5">
            {[
              {
                id: "profile", label: "Profile",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
              },
              {
                id: "password", label: "Security",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#7C3AED] text-white"
                    : "text-gray-400 hover:bg-[#262626] hover:text-white"
                }`}
              >
                <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {tab.icon}
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-7 overflow-y-auto relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Profile tab */}
          {activeTab === "profile" && (
            <div className="space-y-6 pr-4">
              <h3 className="text-xl font-bold text-white">Profile Settings</h3>

              {/* Username */}
              <form onSubmit={handleSaveUsername} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      maxLength={32}
                      className="w-full bg-[#262626] border border-[#404040] rounded-xl px-4 py-3 pr-10 text-white
                        focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition"
                      placeholder="Enter username"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {statusIcon()}
                    </span>
                  </div>
                  {usernameStatus === "taken" && (
                    <p className="mt-1 text-xs text-red-400">That username is already taken.</p>
                  )}
                  {usernameChanged && usernameInput.trim().length >= 3 && usernameStatus !== "taken" && (
                    <p className="mt-1 text-xs text-gray-500">
                      {usernameInput.trim().length}/32 characters
                    </p>
                  )}
                  {usernameInput.trim().length > 0 && usernameInput.trim().length < 3 && (
                    <p className="mt-1 text-xs text-amber-400">Minimum 3 characters required.</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={!usernameChanged || savingUsername || usernameInput.trim().length < 3 || usernameStatus === "taken"}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-medium
                      transition-all hover:bg-[#6D28D9] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {savingUsername && <Loader2 size={14} className="animate-spin" />}
                    {savingUsername ? "Saving…" : "Save Username"}
                  </button>
                  {usernameChanged && (
                    <button
                      type="button"
                      onClick={() => { setUsernameInput(user?.username || ""); setUsernameStatus("idle"); }}
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </form>

              {/* Email — always read-only */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-[#262626] border border-[#404040] rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-600">Email cannot be changed.</p>
              </div>
            </div>
          )}

          {/* Security tab */}
          {activeTab === "password" && (
            <div className="space-y-6 pr-4">
              <h3 className="text-xl font-bold text-white">Change Password</h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {[
                  { name: "currentPassword", label: "Current Password" },
                  { name: "newPassword",     label: "New Password"     },
                  { name: "confirmPassword", label: "Confirm New Password" },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>
                    <input
                      type="password"
                      name={name}
                      value={passwordData[name]}
                      onChange={handlePasswordChange}
                      className="w-full bg-[#262626] border border-[#404040] rounded-xl px-4 py-3 text-white
                        focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition"
                      required
                    />
                  </div>
                ))}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-medium
                      transition-all hover:bg-[#6D28D9] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {savingPassword && <Loader2 size={14} className="animate-spin" />}
                    {savingPassword ? "Updating…" : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;
