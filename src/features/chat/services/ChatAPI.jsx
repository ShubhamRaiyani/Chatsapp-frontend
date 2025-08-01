// features/chat/services/ChatAPI.js
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const ChatAPI = {
  async getAllChats() {
    try {
      const response = await fetch(`${API_BASE}/chats`, {
        method: "GET",
        credentials: "include", // ✅ HttpOnly cookies
        headers: { "Content-Type": "application/json" },
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

  async createPersonalChat(receiverEmail) {
    try {
      const response = await fetch(`${API_BASE}/chats/personal`, {
        method: "POST",
        credentials: "include", // ✅ HttpOnly cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverEmail }),
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

  async createGroupChat(name, memberEmails = []) {
    try {
      const response = await fetch(`${API_BASE}/chats/group`, {
        method: "POST",
        credentials: "include", // ✅ HttpOnly cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          memberIds: memberEmails,
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

  async getMessagesForChat(chatId, page = 0, size = 20) {
    try {
      const response = await fetch(
        `${API_BASE}/messages/chat/${chatId}?page=${page}&size=${size}`,
        {
          method: "GET",
          credentials: "include", // ✅ HttpOnly cookies
          headers: { "Content-Type": "application/json" },
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

  async getMessagesForGroup(groupId, page = 0, size = 20) {
    try {
      const response = await fetch(
        `${API_BASE}/messages/group/${groupId}?page=${page}&size=${size}`,
        {
          method: "GET",
          credentials: "include", // ✅ HttpOnly cookies
          headers: { "Content-Type": "application/json" },
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
};

export default ChatAPI;
