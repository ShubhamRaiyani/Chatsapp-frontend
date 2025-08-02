import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import {
  AuthProvider,
  useAuth,
  AuthPage,
  EmailVerificationPage,
  OAuthRedirectHandler,
} from "../features/auth";

import {
  Dashboard,
  ChatProvider,
  TypingProvider,
  SubscriptionProvider,
} from "../features/chat";
import ErrorBoundary from "../shared/components/ui/ErrorBoundary";

///////////////////////////////////
// Authentication gating component
///////////////////////////////////
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Show a loading UI while auth state is loading
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-lg">Loading authentication...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Allowed to access the protected component
  return children;
}

///////////////////////////////////
// Conditional redirect for unknown routes
///////////////////////////////////
function AuthStateRedirect() {
  const { isAuthenticated, loading } = useAuth();
  console.log("AuthStateRedirect - isAuthenticated:", isAuthenticated);
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-lg">Loading authentication...</p>
      </div>
    );
  }

  // Redirect based on authentication state
  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/auth" replace />
  );
}

///////////////////////////////////
// Main App component
///////////////////////////////////
export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <TypingProvider>
          <SubscriptionProvider>
            <BrowserRouter>
              <ErrorBoundary>
                <Routes>
                  {/* Public: Login/Register page */}
                  <Route path="/auth" element={<AuthPage />} />

                  {/* Public: Email verification page */}
                  <Route path="/verify" element={<EmailVerificationPage />} />

                  {/* OAuth callback processing page */}
                  <Route
                    path="/oauth2/redirect"
                    element={<OAuthRedirectHandler />}
                  />

                  {/* Protected Dashboard route */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Redirect root to dashboard or auth based on state */}
                  <Route path="/" element={<AuthStateRedirect />} />

                  {/* Catch-all: redirect unknown routes based on auth state */}
                  <Route path="*" element={<AuthStateRedirect />} />
                </Routes>
              </ErrorBoundary>
            </BrowserRouter>
          </SubscriptionProvider>
        </TypingProvider>
      </ChatProvider>
    </AuthProvider>
  );
}
