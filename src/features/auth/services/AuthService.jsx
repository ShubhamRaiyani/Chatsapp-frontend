// src/features/auth/services/AuthService.js

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const AuthService = {
  async login(email, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        response.message ="Invalid email or password";
      } else if (response.status === 500) {
        response.message = "Server error. Please try again later.";
      } else {
        response.message = data.message || `Unexpected error (${response.status})`;
      }
    }

    return data;

  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Network error. Please check your internet connection.");
    }
    throw error;
  }
},


 async register(username, email, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      // Extract meaningful message
      const errorMessage = isJson
        ? data.message || `Error (${response.status})`
        : data || `Error (${response.status})`;

      if (response.status === 400) {
        response.message = "Email already verified or username taken";
      } else if (response.status === 409) {
        response.message = "Email or username already exists";
      } else if (response.status === 500) {
        response.message = "Server error. Please try again later.";
      } else {
        throw new Error(errorMessage || "Registration failed");
      }
    }

    // Success — return string message or full object depending on backend
    return isJson ? data.message : data;

  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Network error. Please check your internet connection.");
    }
    console.error("Registration error:", error);
    throw error;
  }
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
    
    return true;
  },

  // async handleOAuthCallback({ code, state }) {
  //   const response = await fetch(`${API_BASE}/auth/oauth2/callback`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ code, state }),
  //     credentials: "include",
  //   });
  //   if (!response.ok) {
  //     const err = await response.json();
  //     throw new Error(err.message || "OAuth callback failed");
  //   }
  //   return response.json();
  // },


  async handleOAuthCallback(token) {
    const response = await fetch(`${API_BASE}/auth/oauth2/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      credentials: "include", // Essential for HttpOnly cookies
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "OAuth callback failed");
    }

    return true;
  },

  async verifyEmail(token) {
    const response = await fetch(`${API_BASE}/auth/verify?token=${encodeURIComponent(token)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Email verification failed");
    }

    return true;
  },

  // Start OAuth flow (redirect to provider)
  initiateOAuth(provider = "google") {
    window.location.href = `${API_BASE}/oauth2/authorization/${provider}`;
  },
};

export default AuthService;
