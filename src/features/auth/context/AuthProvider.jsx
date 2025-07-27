import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import AuthService from "../services/AuthService";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulate loading user from token/session storage on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const usr = await AuthService.getCurrentUser();
        setUser(usr);
      } catch (err) {
        setUser(null);
        console.error("Failed to load user:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await AuthService.login(email, password);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || "Failed to login" };
    }
  };

  const register = async (username, email, password) => {
    try {
      const data = await AuthService.register(username, email, password);
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: err.message || "Failed to register" };
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}
