// src/features/auth/pages/EmailVerificationPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function EmailVerificationPage() {
  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState("");
  const { verifyEmail } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    // Call backend verification via verifyEmail(token)
    verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Email verified successfully! Redirecting to login...");
        // Redirect to login page after a delay
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      })
      .catch((error) => {
        setStatus("error");
        setMessage(
          error?.message ||
            "Verification failed. Your link may be expired or already verified."
        );
      });
  }, [location.search, navigate, verifyEmail]);

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-[#1c1c1c] rounded shadow-lg text-white text-center">
      {status === "verifying" && (
        <>
          <p className="mb-4">Verifying your email, please wait...</p>
          <svg
            className="animate-spin mx-auto mb-4 h-8 w-8 text-[#ae7aff]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Loading spinner"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </>
      )}

      {(status === "success" || status === "error") && (
        <>
          <h1
            className={`text-2xl font-bold mb-4 ${
              status === "success" ? "text-green-400" : "text-red-500"
            }`}
          >
            {status === "success" ? "Success!" : "Error"}
          </h1>
          <p>{message}</p>

          {status === "error" && (
            <button
              onClick={() => navigate("/auth")}
              className="mt-6 bg-[#ae7aff] text-black px-4 py-2 rounded font-semibold hover:bg-[#915adb]"
            >
              Back to Login
            </button>
          )}
        </>
      )}
    </div>
  );
}
