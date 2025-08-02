import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function OAuthRedirectHandler() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("processing"); // "processing" | "success" | "error"
  const [error, setError] = useState(null);

  useEffect(() => {
    async function handleOAuth() {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");
      const errParam = params.get("error");

      if (errParam) {
        setError(decodeURIComponent(errParam));
        setStatus("error");
        return;
      }

      if (!token) {
        setError("No token received");
        setStatus("error");
        return;
      }

      try {
        await loginWithToken(token);
        setStatus("success");

        // Clean URL to remove token param
        window.history.replaceState({}, "", "/");

        // Delay to show success message
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1500);
      } catch (e) {
        setError(e.message || "Authentication failed");
        setStatus("error");
      }
    }

    handleOAuth();
  }, [location.search, loginWithToken, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <div className="max-w-md w-full text-center">
        {status === "processing" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-gray-700 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Completing OAuth login...</h2>
            <p className="text-gray-400">
              Please wait while we authenticate your account.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-400 mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-400">
              Login successful!
            </h2>
            <p className="text-gray-400">Redirecting to dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-500 mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-400">Login failed</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => navigate("/auth")}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded text-white font-semibold"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
