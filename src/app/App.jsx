import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Context Provider and hook
// import { AuthProvider } from "./contexts/AuthProvider";
// import { useAuth } from "./hooks/useAuth" //if separated

import {
  AuthProvider,
  useAuth,
  AuthPage,
  EmailVerificationPage,
  OAuthRedirectHandler,
} from "../features/auth";

// Page Components
// import AuthPage from "./pages/AuthPage";
import {
  Dashboard,
  ChatProvider,
  TypingProvider,
  SubscriptionProvider,
} from "../features/chat"; // Or ChatPage
// import EmailVerificationPage from "./pages/EmailVerificationPage";
// import OAuthRedirectHandler from "./pages/OAuthRedirectHandler";

// ProtectedRoute component to guard dashboard
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Optionally show loading indicator while checking auth state
  if (loading)
    return (
      <div className="w-full h-screen flex items-center justify-center text-lg text-white">
        Loading...
      </div>
    );

  // Redirect unauthenticated users to auth page
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  // Allow access if authenticated
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <TypingProvider>
          <SubscriptionProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Auth Page (Login/Register toggle) */}
                <Route path="/auth" element={<AuthPage />} />
                <Route
                  path="/oauth2/redirect"
                  element={<OAuthRedirectHandler />}
                />
                {/* <Route path="/auth2" element={<Dashboard />} /> */}
                {/* Email Verification page, user arrives here via email link */}
                <Route
                  path="/verify-email"
                  element={<EmailVerificationPage />}
                />
                Main Dashboard (protected)
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                {/* Default route logic */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
                {/* Catch-all: redirect unknown routes to auth or dashboard based on auth state */}
                <Route
                  path="*"
                  element={
                    // Decide destination based on user state
                    <AuthStateRedirect />
                  }
                />
              </Routes>
            </BrowserRouter>
          </SubscriptionProvider>
        </TypingProvider>
      </ChatProvider>
    </AuthProvider>
  );
}

// Helper to redirect unknown routes contextually
function AuthStateRedirect() {
  const { isAuthenticated, loading } = useAuth();
  console.log("AuthStateRedirect", { isAuthenticated, loading });
  if (loading)
    return (
      <div className="w-full h-screen flex items-center justify-center text-lg text-white">
        Loading...
      </div>
    );
  return isAuthenticated ? (
    <Navigate to="/dashboard" />
  ) : (
    <Navigate to="/auth" />
  );
}
