import apiClient from "../../../shared/utils/api";

const AuthService = {
    async login(email, password) {
        try {
            const response = await apiClient.post("/auth/login", { email, password });
            return response.data;
        } catch (error) {
            // api.js interceptor already extracts specific message from backend 
            // into error.customMessage. We should use that preferably.
            throw new Error(error.customMessage || error.message);
        }
    },

    async register(username, email, password) {
        try {
            const response = await apiClient.post("/auth/register", { username, email, password });
            return response.data;
        } catch (error) {
            throw new Error(error.customMessage || "Registration failed");
        }
    },

    async logout() {
        await apiClient.post("/auth/logout");
        // clear any local client state if needed
    },

    async getCurrentUser() {
        try {
            const response = await apiClient.get("/users/me");
            return response.data;
        } catch (error) {
            // If 401 or similar, just return null (not logged in)
            return null;
        }
    },

    async getUserById(userId) {
        try {
            const response = await apiClient.get(`/users/${userId}`);
            return response.data;
        } catch (error) {
            return null;
        }
    },

    async getAllUsers() {
        try {
            const response = await apiClient.get("/users");
            return response.data;
        } catch (error) {
            return [];
        }
    },

    async handleOAuthCallback(token) {
        try {
            // The original code passed { token } in body
            const response = await apiClient.post("/auth/oauth2/callback", { token });
            return true; // Original returned true on success
        } catch (error) {
            throw new Error(error.customMessage || "OAuth callback failed");
        }
    },

    async verifyEmail(token) {
        try {
            await apiClient.get(`/auth/verify?token=${encodeURIComponent(token)}`);
            return true;
        } catch (error) {
            throw new Error(error.customMessage || "Email verification failed");
        }
    },

    async requestPasswordReset(email) {
        try {
            const response = await apiClient.post("/auth/forgot-password", { email });
            return response.data;
        } catch (error) {
            throw new Error(error.customMessage || "Failed to request password reset");
        }
    },

    async resetPassword(token, newPassword) {
        try {
            const response = await apiClient.post("/auth/reset-password", { token, newPassword });
            return response.data;
        } catch (error) {
            throw new Error(error.customMessage || "Failed to reset password");
        }
    },

    async changePassword(oldPassword, newPassword) {
        try {
            const response = await apiClient.post("/auth/change-password", { oldPassword, newPassword });
            return response.data;
        } catch (error) {
            throw new Error(error.customMessage || "Failed to change password");
        }
    },

    async refreshToken() {
        try {
            const response = await apiClient.post("/auth/refresh-token");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Start OAuth flow (redirect to provider)
    initiateOAuth(provider = "google") {
        // This is a browser redirect, not an API call, so we still need the base URL
        // We can use the apiClient.defaults.baseURL or just import the env var again if needed.
        // Accessing correct baseURL from axios instance:
        const baseUrl = apiClient.defaults.baseURL;
        window.location.href = `${baseUrl}/oauth2/authorization/${provider}`;
    },
};

export default AuthService;
