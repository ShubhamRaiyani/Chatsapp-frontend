// src/pages/OAuthRedirectHandler.jsx
// Parse the token from the URL query parameters after your backend OAuth redirect
// Send it securely to your backend to set the HttpOnly cookie (via a POST request)
// Redirect users to the dashboard on success, or the auth page on failure
// Show loading or error state during this process

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function OAuthRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("processing"); // "processing", "error"

  useEffect(() => {
    // Extract token from URL query parameters
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      // No token found in URL
      setStatus("error");
      return;
    }

    // Send token to backend to set HttpOnly cookie
    async function sendTokenToBackend() {
      try {
        const response = await fetch(
          "http://localhost:8080/api/auth/oauth2/callback",
          {
            method: "POST",
            credentials: "include", // important to send cookies and receive HttpOnly cookie
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to authenticate with backend");
        }

        // Success: redirect to dashboard
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("OAuth redirect error:", err);
        setStatus("error");
      }
    }

    sendTokenToBackend();
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] text-white p-6">
      {status === "processing" && (
        <p className="text-lg">Processing OAuth login...</p>
      )}

      {status === "error" && (
        <div className="text-center">
          <p className="text-lg mb-4 text-red-500">
            OAuth login failed. Please try again.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="bg-[#ae7aff] text-black px-6 py-3 rounded font-bold hover:bg-purple-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
}
