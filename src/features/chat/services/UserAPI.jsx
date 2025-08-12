// features/chat/services/UserAPI.js

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const UserAPI = {
  /**
   * Search users by email fragment
   * @param {string} emailFragment - The email fragment to search for (minimum 3 characters)
   * @returns {Promise<Array>} Array of UserDTO objects
   */
  async searchUsers(emailFragment) {
    if (!emailFragment || emailFragment.trim().length < 3) {
      return [];
    }

    try {
      const response = await fetch(
        `${API_BASE}/users/search?emailFragment=${encodeURIComponent(
          emailFragment.trim()
        )}`,
        {
          method: "GET",
          credentials: "include", // Include HttpOnly cookies
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return []; // No users found
        }
        throw new Error(`Failed to search users: ${response.status}`);
      }

      const users = await response.json();
      console.log("🔍 Search results:", users);
      return users;
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  },

  /**
   * Get user profile by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User profile
   */
  async getUserByEmail(email) {
    try {
      const response = await fetch(
        `${API_BASE}/users/profile?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get user: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  },
};

export default UserAPI;
