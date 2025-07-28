// features/chat/services/ChatAPI.js
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const ChatAPI = {
  // Get all chats for dashboard - matches /api/chats GET
  async getAllChats() {
    try {
      const response = await fetch(`${API_BASE}/chats`, {
        method: "GET",
        credentials: "include", // Include HTTP-only cookies for auth
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch chats: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching chats:", error);
      throw error;
    }
  },

  // Get chat details - matches /api/chats/chat/{chatId}/details
  async getChatDetails(chatId, currentUserEmail) {
    try {
      const response = await fetch(
        `${API_BASE}/chats/chat/${chatId}/details?currentUserEmail=${encodeURIComponent(
          currentUserEmail
        )}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch chat details: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching chat details:", error);
      throw error;
    }
  },

  // Create personal chat - matches /api/chats/personal POST
  async createPersonalChat(receiverEmail) {
    try {
      const response = await fetch(`${API_BASE}/chats/personal`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverEmail,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create personal chat: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating personal chat:", error);
      throw error;
    }
  },

  // Create group chat - matches /api/chats/group POST
  async createGroupChat(name, memberEmails = []) {
    try {
      const response = await fetch(`${API_BASE}/chats/group`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          memberIds: memberEmails, // Backend expects memberIds array
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create group chat: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating group chat:", error);
      throw error;
    }
  },

  // Get paginated messages for a chat - matches /api/messages/chat/{chatId}
  async getMessagesForChat(chatId, page = 0, size = 20) {
    try {
      const response = await fetch(
        `${API_BASE}/messages/chat/${chatId}?page=${page}&size=${size}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch chat messages: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      throw error;
    }
  },

  // Get paginated messages for a group - matches /api/messages/group/{groupId}
  async getMessagesForGroup(groupId, page = 0, size = 20) {
    try {
      const response = await fetch(
        `${API_BASE}/messages/group/${groupId}?page=${page}&size=${size}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch group messages: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching group messages:", error);
      throw error;
    }
  },

  // Note: The following methods are NOT implemented in your backend yet
  // They are commented out but kept for future implementation

  /*
  // Mark message as read - BACKEND ENDPOINT NEEDED
  async markMessageAsRead(chatId, messageId, userId) {
    try {
      const response = await fetch(`${API_BASE}/messages/${messageId}/read`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark message as read: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }
  },

  // Mark multiple messages as read - BACKEND ENDPOINT NEEDED
  async markMessagesAsRead(chatId, messageIds, userId) {
    try {
      const response = await fetch(`${API_BASE}/messages/mark-read`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId, messageIds, userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark messages as read: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }
  },

  // Edit message - BACKEND ENDPOINT NEEDED
  async editMessage(messageId, newContent) {
    throw new Error("Edit message not implemented in backend yet");
  },

  // Delete message - BACKEND ENDPOINT NEEDED  
  async deleteMessage(messageId) {
    throw new Error("Delete message not implemented in backend yet");
  },

  // React to message - BACKEND ENDPOINT NEEDED
  async reactToMessage(messageId, emoji) {
    throw new Error("Message reactions not implemented in backend yet");
  },

  // Upload file - BACKEND ENDPOINT NEEDED
  async uploadFile(file, onProgress) {
    throw new Error("File upload not implemented in backend yet");
  },

  // Search messages - BACKEND ENDPOINT NEEDED
  async searchMessages(query, chatId = null) {
    throw new Error("Message search not implemented in backend yet");
  }
  */
};

export default ChatAPI;
