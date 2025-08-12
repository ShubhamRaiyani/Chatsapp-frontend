// features/chat/hooks/useChat.js - Optimized without chatDetails

import { useCallback, useEffect, useState, useContext, useMemo } from "react";
import ChatContext from "../context/ChatContext";

export function useChat(chatId = null, filterType = null) {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }

  // Destructure context values
  const {
    chats,
    allMessages,
    // ✅ REMOVED: chatDetails - no longer needed since chat has all details
    loading,
    error,
    connected,
    sendingMessage,
    pagination,
    loadMoreMessages: loadMoreFromProvider,
    sendMessage: sendFromProvider,
    createPersonalChat,
    createGroupChat,
    selectChat,
    currentUser,
    refreshChats,
    clearError,
    // ✅ REMOVED: loadChatDetails - no longer needed
  } = context;

  // Local state for this hook instance
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);

  // ✅ Filter chats based on type
  const filteredChats = useMemo(() => {
    if (!filterType || filterType === "chats") {
      return chats; // Return all chats
    }

    return chats.filter((chat) => {
      switch (filterType) {
        case "direct":
          return !chat.isGroup; // Personal/direct messages
        case "groups":
          return chat.isGroup; // Group chats
        default:
          return true; // All chats
      }
    });
  }, [chats, filterType]);

  // ✅ Get chat counts by category
  const chatCounts = useMemo(() => {
    const direct = chats.filter((chat) => !chat.isGroup).length;
    const groups = chats.filter((chat) => chat.isGroup).length;
    return {
      chats: chats.length,
      direct,
      groups,
    };
  }, [chats]);

  // Get messages for the specific chatId or current selected chat
  const chatMessages = chatId
    ? allMessages[chatId] || []
    : context.messages || [];

  // Load more messages for pagination with loading state
  const loadMoreMessages = useCallback(async () => {
    if (!chatId || messageLoading) return;

    const chatPagination = pagination;
    if (!chatPagination?.hasMore) return;

    try {
      setMessageLoading(true);
      await loadMoreFromProvider();
    } catch (err) {
      console.error("Failed to load more messages:", err);
    } finally {
      setMessageLoading(false);
    }
  }, [chatId, messageLoading, loadMoreFromProvider, pagination]);

  // Send message wrapper
  const sendMessage = useCallback(
    async (content, receiverEmail) => {
      return await sendFromProvider(content, receiverEmail);
    },
    [sendFromProvider]
  );

  // Update hasMoreMessages state as pagination changes
  useEffect(() => {
    if (!chatId) {
      setHasMoreMessages(false);
      return;
    }

    const chatPagination = pagination;
    setHasMoreMessages(!!chatPagination?.hasMore);
  }, [pagination, chatId]);

  // Helper functions for components
  const getChatById = useCallback(
    (id) => chats.find((chat) => chat.id === id),
    [chats]
  );

  const getUnreadCount = useCallback(
    (id) => {
      // ✅ Now use unreadCount from ChatDTO
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

  return {
    // Data
    chats: filteredChats, // ✅ Filtered chats based on type (now with full details)
    allChats: chats, // ✅ All chats unfiltered (now with full details)
    chatCounts, // ✅ Counts by category
    // ✅ REMOVED: chatDetails - no longer needed since chat has all details
    messages: chatMessages,
    allMessages,
    loading: loading || messageLoading,
    error,
    connected,
    hasMoreMessages,
    sendingMessage,
    pagination,

    // Actions
    sendMessage, // ✅ Uses receiverEmail directly from chat object
    loadMoreMessages,
    createPersonalChat,
    createGroupChat,
    selectChat, // ✅ Simplified - no separate details loading
    refreshChats,
    clearError,
    // ✅ REMOVED: loadChatDetails - no longer needed

    // Helper functions
    getChatById,
    getUnreadCount, // ✅ Now uses unreadCount from ChatDTO
    getChatMessages,
    getChatsByType, // ✅ Get chats by specific type

    // Current user info
    currentUser,

    // Raw context access if needed
    context,
  };
}
