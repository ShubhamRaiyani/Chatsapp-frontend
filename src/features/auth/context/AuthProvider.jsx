import React, { useState, useEffect, useCallback } from "react";
import AuthService from "../services/AuthService"; // your API calls wrapper
import AuthContext from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // User profile data
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Loading user profile
  const [error, setError] = useState(null);

  // Fetch user profile from backend API
  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await AuthService.getCurrentUser();
      console.log("Fetched user profile:", profile);
      if (profile) {
        setUser(profile);
        setIsAuthenticated(true);
        setError(null);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch user profile");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load of user profile
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Login with email/password
  const login = useCallback(
    async (email, password) => {
      // setLoading(true); // Handled locally in component to avoid full page loader
      setError(null);
      try {
        const resp = await AuthService.login(email, password);
        await fetchUserProfile();
        return { success: true , message: resp.message};
      } catch (err) {
        setError(err.message);
        return { success: false, message: err.message };
      } finally {
        // setLoading(false);
      }
    },
    [fetchUserProfile]
  );

  // Register new user
  const register = useCallback(async (username, email, password) => {
    // setLoading(true); // Handled locally
    setError(null);
    try {
      const res = await AuthService.register(username, email, password);
      // res is likely the response body object, e.g., { message: "...", email: "..." }
      const successMessage = res?.message || "Registration successful. Please check your email for the verification link.";
      return {
        success: true,
        message: successMessage,
      };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      // setLoading(false);
    }
  }, []);

  // Logout user
  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch {
      // ignore errors
    }
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Verify email
  const verifyEmail = useCallback(async (token) => {
    setLoading(true);
    setError(null);
    try {
      const res = await AuthService.verifyEmail(token);
      return res;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // OAuth login by sending token to backend -> sets cookie + updates user
  const loginWithToken = useCallback(
    async (token) => {
      setLoading(true);
      setError(null);
      try {
        await AuthService.handleOAuthCallback(token);
        await fetchUserProfile();
      } catch (err) {
        setError(err.message || "OAuth login failed");
      } finally {
        setLoading(false);
      }
    },
    [fetchUserProfile]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        verifyEmail,
        loginWithToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
