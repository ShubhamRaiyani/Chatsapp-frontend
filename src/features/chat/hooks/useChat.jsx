import { useCallback, useEffect, useState, useContext } from "react";
import ChatContext from "../context/ChatContext";

export function useChat(chatId = null) {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }

  const {
    chats,
    messages,
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
    refreshChats, // alias for loadChats exposed as refreshChats
  } = context;

  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);

  // Get messages for the specific chatId or empty array if none
  const chatMessages = chatId ? messages[chatId] || [] : [];

  // Load more messages for pagination
  const loadMoreMessages = useCallback(async () => {
    if (!chatId || messageLoading) return;

    // Check if pagination info exists for this chat
    const chatPagination = pagination && pagination[chatId];
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

  // Send message wrapper - calls provider sendMessage
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

    const chatPagination = pagination && pagination[chatId];
    setHasMoreMessages(!!chatPagination?.hasMore);
  }, [pagination, chatId]);

  return {
    // Data
    chats,
    messages: chatMessages,
    loading: loading || messageLoading,
    error,
    connected,
    hasMoreMessages,
    sendingMessage,
    pagination: pagination ? pagination[chatId] : null,

    // Actions
    sendMessage,
    loadMoreMessages,
    createPersonalChat,
    createGroupChat,
    selectChat,
    refreshChats,

    // Helpers
    getChatById: (id) => chats.find((chat) => chat.id === id),
    getUnreadCount: (id) => {
      // Placeholder: implement if your backend exposes this or calculate client-side
      return 0;
    },

    // Current user info
    currentUser,

    // Expose the whole context if needed
    context,
  };
}
