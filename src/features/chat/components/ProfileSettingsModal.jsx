import React, { useState } from "react";
import { toast } from "react-hot-toast";
import Avatar from "./ui/Avatar";
import AuthService from "../../auth/services/AuthService";

const ProfileSettingsModal = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState("profile"); // profile, password
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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

    setIsSubmitting(true);
    try {
      await AuthService.changePassword(
        passwordData.currentPassword, // This becomes 'oldPassword' in the API call
        passwordData.newPassword
      );
      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      // Optional: Close modal or switch tab
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-[#1A1A1A] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#262626] overflow-hidden flex flex-col md:flex-row h-[600px] md:h-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-[#212121] p-6 border-b md:border-b-0 md:border-r border-[#262626]">
          <div className="flex flex-col items-center mb-8">
            <Avatar 
                src={user?.avatar} 
                alt={user?.name} 
                size="lg" 
                className="mb-3"
            />
            <h2 className="text-white font-semibold text-lg">{user?.name}</h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${
                activeTab === "profile"
                  ? "bg-[#7C3AED] text-white"
                  : "text-gray-400 hover:bg-[#262626] hover:text-white"
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${
                activeTab === "password"
                  ? "bg-[#7C3AED] text-white"
                  : "text-gray-400 hover:bg-[#262626] hover:text-white"
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Security
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto relative">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

          {activeTab === "profile" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">Profile Settings</h3>
              {/* Read-only details for now */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                  <input
                    type="text"
                    value={user?.username || ""}
                    disabled
                    className="w-full bg-[#262626] border border-[#404040] rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full bg-[#262626] border border-[#404040] rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "password" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">Change Password</h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-[#262626] border border-[#404040] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-[#262626] border border-[#404040] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-[#262626] border border-[#404040] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition"
                    required
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-3 rounded-xl bg-[#7C3AED] text-white font-medium transition-all ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-[#6D28D9] hover:shadow-lg"
                    }`}
                  >
                    {isSubmitting ? "Updating..." : "Update Password"}
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
