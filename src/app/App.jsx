import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import {
  useAuth,
  AuthPage,
  EmailVerificationPage,
  OAuthRedirectHandler,
  ForgotPasswordPage, 
  ResetPasswordPage,
} from "../features/auth";

import {
  Dashboard,
} from "../features/chat";
import ErrorBoundary from "../shared/components/ui/ErrorBoundary";
import AppProviders from "./AppProviders";

///////////////////////////////////
// Authentication gating component
///////////////////////////////////
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-lg">Loading authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

///////////////////////////////////
// Public-only gating component
// Redirects to dashboard if already logged in
///////////////////////////////////
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
      return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
          <p className="text-lg">Loading...</p>
        </div>
      );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

///////////////////////////////////
// Conditional redirect for unknown routes
///////////////////////////////////
function AuthStateRedirect() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-lg">Loading authentication...</p>
      </div>
    );
  }

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
    <AppProviders>
      <BrowserRouter>
        <ErrorBoundary>
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes (only accessible if NOT logged in) */}
            <Route 
              path="/auth" 
              element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/reset-password" 
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              } 
            />

            {/* Public: Email verification (accessible to anyone basically, but logical to be public) */}
            <Route path="/verify" element={<EmailVerificationPage />} />

            {/* OAuth callback processing page - usually transient, can be public or guarded specifically */}
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
    </AppProviders>
  );
}
