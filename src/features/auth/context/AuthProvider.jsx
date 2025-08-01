import React, {
  useState,
  useEffect,
  useCallback,
} from "react";
import AuthService from "../services/AuthService";
import AuthContext from "./AuthContext";


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // User profile
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile from backend API
  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await AuthService.getCurrentUser();
      if (profile) {
        setUser(profile);
        setIsAuthenticated(true);
        setError(null);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      console.error("Failed to fetch user profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount, check if user is logged in
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Login method
  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);
      try {
        await AuthService.login(email, password);
        // Refresh profile after login
        await fetchUserProfile();
        setLoading(false);
        setIsAuthenticated(true);
        return { success: true };
      } catch (err) {
        setError(err.message);
        setLoading(false);
        return { success: false, error: err.message };
      }
    },
    [fetchUserProfile]
  );

  // Register method
  const register = useCallback(async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await AuthService.register(username, email, password);
      setLoading(false);
      return {
        success: true,
        message:
          res.message || "Registration successful! Please verify your email.",
      };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  // Logout method
  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch (e) {
      // ignore errors
      console.error("Logout failed:", e);
    }
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  // Verify email
  const verifyEmail = useCallback(async (token) => {
    setLoading(true);
    setError(null);
    try {
      const res = await AuthService.verifyEmail(token);
      setLoading(false);
      return res;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  // Handle OAuth callback
  const handleOAuthCallback = useCallback(
    async () => {
      // The token is handled by backend, so just refresh profile here
      await fetchUserProfile();
      setIsAuthenticated(true);
    },
    [fetchUserProfile]
  );

  // Provide the auth state and methods to children
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
        handleOAuthCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
