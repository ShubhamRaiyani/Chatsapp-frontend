import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import AuthService from "../services/AuthService";
import logo from "../../../assets/images/logo.png";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      // Optionally redirect immediately, but might let user read the error first
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Missing reset token.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await AuthService.resetPassword(token, password);
      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (error) {
      toast.error(error.message || "Failed to reset password. Link may be expired.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-md p-8 bg-[#12121f] text-gray-100 rounded-3xl shadow-2xl border border-gray-800">
        <div className="flex flex-col items-center mb-6">
          <img
            src={logo}
            alt="Chatsapp Logo"
            className="w-16 h-16 mb-4 shadow-lg"
          />
          <h2 className="text-2xl font-bold">New Password</h2>
          <p className="text-gray-400 text-sm mt-2 text-center">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ae7aff] focus:border-transparent transition"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ae7aff] focus:border-transparent transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-[#ae7aff] text-black font-semibold py-3 rounded-lg transition 
              ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-[#915adb]"}`}
          >
            {isSubmitting ? "Resetting..." : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
