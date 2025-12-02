// features/chat/hooks/useChat.js

import { useCallback, useState, useContext, useMemo } from "react";
import ChatContext from "../context/ChatContext";

export function useChat(chatId = null, filterType = null) {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }

  const {
    // state from provider
    chats,
    messages: currentMessages, // messages for selectedChat
    allMessages, // { [chatId]: [...] }
    loading,
    error,
    connected,
    sendingMessage,
    pagination: currentPagination, // pagination ONLY for selectedChat

    // actions from provider
    loadMoreMessages: loadMoreFromProvider, // works on selectedChat
    sendMessage: sendFromProvider,
    leaveGroup: leaveGroupFromProvider,
    createPersonalChat,
    createGroupChat,
    selectChat,
    currentUser,
    refreshChats,
    refreshMessages,
    // clearError might exist in your real provider; if yes, you can also pull it
  } = context;

  // Local loading just for "load more"
  const [messageLoading, setMessageLoading] = useState(false);

  // ===========================
  // Filters / counts
  // ===========================

  const filteredChats = useMemo(() => {
    if (!filterType || filterType === "chats") {
      return chats;
    }

    return chats.filter((chat) => {
      switch (filterType) {
        case "direct":
          return !chat.isGroup;
        case "groups":
          return chat.isGroup;
        default:
          return true;
      }
    });
  }, [chats, filterType]);

  const chatCounts = useMemo(() => {
    const direct = chats.filter((chat) => !chat.isGroup).length;
    const groups = chats.filter((chat) => chat.isGroup).length;
    return {
      chats: chats.length,
      direct,
      groups,
    };
  }, [chats]);

  // ===========================
  // Messages for THIS hook
  // ===========================

  // If chatId is given, use allMessages[chatId]; else fall back to currentMessages
  const chatMessages = useMemo(
    () => (chatId ? allMessages[chatId] || [] : currentMessages || []),
    [chatId, allMessages, currentMessages]
  );

  // Has more messages? (comes directly from provider for selected chat)
  const hasMoreMessages = !!currentPagination?.hasMore;

  // ===========================
  // Load more (uses provider's selectedChat)
  // ===========================

  const loadMoreMessages = useCallback(async () => {
    // if provider says no more, or already loading, do nothing
    if (!hasMoreMessages || messageLoading) return;

    try {
      setMessageLoading(true);
      // IMPORTANT: provider implementation uses selectedChat internally
      await loadMoreFromProvider();
    } catch (err) {
      console.error("Failed to load more messages:", err);
    } finally {
      setMessageLoading(false);
    }
  }, [hasMoreMessages, messageLoading, loadMoreFromProvider]);

  // ===========================
  // Send / leave / helpers
  // ===========================

  const sendMessage = useCallback(
    async (content, receiverEmail = null) => {
      return await sendFromProvider(content, receiverEmail);
    },
    [sendFromProvider]
  );

  const leaveGroup = useCallback(
    async (groupId) => {
      try {
        return await leaveGroupFromProvider(groupId);
      } catch (err) {
        console.error("Failed to leave group:", err);
        throw err;
      }
    },
    [leaveGroupFromProvider]
  );

  const getChatById = useCallback(
    (id) => chats.find((chat) => chat.id === id),
    [chats]
  );

  const getUnreadCount = useCallback(
    (id) => {
      const chat = chats.find((c) => c.id === id);
      return chat?.unreadCount || 0;
    },
    [chats]
  );

  const getChatMessages = useCallback(
    (id) => allMessages[id] || [],
    [allMessages]
  );

  const getChatsByType = useCallback(
    (type) => {
      switch (type) {
        case "direct":
          return chats.filter((chat) => !chat.isGroup);
        case "groups":
          return chats.filter((chat) => chat.isGroup);
        default:
          return chats;
      }
    },
    [chats]
  );

  // ===========================
  // Return API
  // ===========================

  return {
    // Data
    chats: filteredChats,
    allChats: chats,
    chatCounts,
    messages: chatMessages,
    allMessages,

    // Loading / connection
    loading: loading || messageLoading,
    error,
    connected,
    sendingMessage,

    // Pagination (for selected chat)
    pagination: currentPagination,
    hasMoreMessages,

    // Actions
    sendMessage,
    loadMoreMessages,
    leaveGroup,
    createPersonalChat,
    createGroupChat,
    selectChat,
    refreshChats,
    refreshMessages,

    // Helpers
    getChatById,
    getUnreadCount,
    getChatMessages,
    getChatsByType,

    // Current user
    currentUser,

    // Raw context (if needed)
    context,
  };
}
