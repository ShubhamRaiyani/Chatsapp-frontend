import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import AuthService from "../services/AuthService";
import logo from "../../../assets/images/logo.png";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await AuthService.requestPasswordReset(email);
      toast.success("Password reset link sent to your email!");
      setEmail("");
    } catch (error) {
        // Even if email doesn't exist, it's safer to show success or a generic message 
        // to prevent email enumeration, but depending on requirements we might show the error.
        // For now, we show the error from service if available, or generic.
      toast.error(error.message || "Failed to send reset link.");
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
          <h2 className="text-2xl font-bold">Reset Password</h2>
          <p className="text-gray-400 text-sm mt-2 text-center">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ae7aff] focus:border-transparent transition"
              placeholder="you@example.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-[#ae7aff] text-black font-semibold py-3 rounded-lg transition 
              ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-[#915adb]"}`}
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/auth"
            className="text-sm text-gray-400 hover:text-[#ae7aff] transition flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
