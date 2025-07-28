// src/features/auth/services/AuthService.js

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const AuthService = {
  async login(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // for cookies/session
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Login failed");
    }
    return response.json();
  },

  async register(username, email, password) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Registration failed");
    }
    return response.json();
  },

  async logout() {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    // clear any local client state if needed
  },

  async getCurrentUser() {
    const response = await fetch(`${API_BASE}/users/me`, {
      credentials: "include",
    });
    if (!response.ok) {
      return null;
    }
    return response.json();
  },

  async handleOAuthCallback({ code, state }) {
    const response = await fetch(`${API_BASE}/auth/oauth2/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, state }),
      credentials: "include",
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "OAuth callback failed");
    }
    return response.json();
  },
};

export default AuthService;
