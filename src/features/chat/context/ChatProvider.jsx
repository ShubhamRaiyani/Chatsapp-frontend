// features/chat/contexts/ChatProvider.jsx - Optimized without chatDetails

import React, { useState, useEffect, useCallback, useRef } from "react";
import ChatContext from "./ChatContext";
import ChatAPI from "../services/ChatAPI";
import webSocketService from "../services/WebSocketService";
import { useAuth } from "../../auth/hooks/useAuth";

export function ChatProvider({ children }) {
  // Core state
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  // ✅ REMOVED: chatDetails state - no longer needed since ChatDTO includes all details
  const [messages, setMessages] = useState({}); // { chatId: [messages] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Pagination state for messages
  const [messagePagination, setMessagePagination] = useState({});

  const { user, isAuthenticated } = useAuth();

  // ✅ Session tracking to prevent duplicate connections
  const currentSessionRef = useRef(null);
  const connectionListeners = useRef([]);
  const isMounted = useRef(true);

  // Generate unique session ID per user to prevent duplicate connections
  const generateSessionId = useCallback((user) => {
    if (!user) return null;
    return `${user.email}-${Date.now()}`;
  }, []);

  // Load all chats from API (now includes all details)
  const loadChats = useCallback(async () => {
    if (!isAuthenticated || !isMounted.current) return;

    try {
      setLoading(true);
      setError(null);
      // ✅ This now returns full ChatDTO with receiverEmail, lastActivity, etc.
      const chatsData = await ChatAPI.getAllChats();
      if (isMounted.current) {
        console.log("📋 Loaded chats with full details:", chatsData);
        setChats(chatsData);
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("Error loading chats:", err);
        setError("Failed to load chats");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [isAuthenticated]);

  // ✅ REMOVED: loadChatDetails function - no longer needed

  // ===== FIXED CHATPROVIDER - Handle ASC Pagination Correctly =====

  // In your ChatProvider.jsx - Update loadMessages function:

  // ===== FIXED CHATPROVIDER - Handle ASC Pagination Correctly =====

  // In your ChatProvider.jsx - Update loadMessages function:

  const loadMessages = useCallback(
    async (chatId, isGroup = false, page = 0) => {
      if (!chatId || !isMounted.current) return;

      try {
        console.log(`📥 Loading messages for chat ${chatId}, page ${page}`);

        const messagesData = isGroup
          ? await ChatAPI.getMessagesForGroup(chatId, page, 20)
          : await ChatAPI.getMessagesForChat(chatId, page, 20);

        if (!isMounted.current) return;

        console.log("📄 Loaded messages page:", messagesData);

        setMessages((prevMessages) => {
          const existingMessages = prevMessages[chatId] || [];

          if (page === 0) {
            // ✅ First page: Replace all messages and REVERSE them
            // Since backend sends ASC, we reverse to show newest at bottom
            const reversedMessages = [
              ...(messagesData.content || []),
            ].reverse();
            return {
              ...prevMessages,
              [chatId]: reversedMessages,
            };
          }

          // ✅ Pagination: Prepend older messages to the BEGINNING
          // Since we're loading older messages (ASC order), they go at the start
          const olderMessages = [...(messagesData.content || [])].reverse();
          return {
            ...prevMessages,
            [chatId]: [...olderMessages, ...existingMessages], // Older messages first
          };
        });

        // Update pagination info
        setMessagePagination((prev) => ({
          ...prev,
          [chatId]: {
            currentPage: messagesData.number || 0,
            totalPages: messagesData.totalPages || 1,
            hasMore: !messagesData.last,
            totalElements: messagesData.totalElements || 0,
          },
        }));

        return messagesData;
      } catch (err) {
        if (isMounted.current) {
          console.error("Error loading messages:", err);
          setError("Failed to load messages");
        }
      }
    },
    []
  );
  const refreshMessages = useCallback(
    async (chatId, isGroup = false) => {
      if (!chatId || !isMounted.current) return;

      console.log(`🔄 Refreshing messages for chat ${chatId}`);
      await loadMessages(chatId, isGroup, 0); // Reload page 0 (latest messages)
    },
    [loadMessages]
  );

  // ✅ WebSocket connection setup
  useEffect(() => {
    isMounted.current = true;

    if (!isAuthenticated || !user) {
      // User logged out - cleanup existing connection
      if (currentSessionRef.current) {
        console.log("🧹 User logged out, cleaning up WebSocket");
        webSocketService.forceDisconnect();
        currentSessionRef.current = null;
        setConnected(false);
      }
      return;
    }

    // Generate session ID for this user
    const sessionId = generateSessionId(user);

    // If same session, don't reconnect
    if (currentSessionRef.current === sessionId) {
      console.log("✅ Same user session, keeping existing connection");
      return;
    }

    const initializeConnection = async () => {
      try {
        console.log("🚀 Initializing WebSocket for session:", sessionId);
        currentSessionRef.current = sessionId;

        // ✅ Connect with session ID - prevents duplicates
        await webSocketService.connect(sessionId);

        if (!isMounted.current) return;

        // Set up connection status listener
        const unsubscribeConnection = webSocketService.onConnectionChange(
          (isConnected) => {
            if (isMounted.current) {
              console.log(
                `🔌 WebSocket status: ${
                  isConnected ? "Connected" : "Disconnected"
                }`
              );
              setConnected(isConnected);
            }
          }
        );

        // Set up message listener for real-time updates
        const unsubscribeMessages = webSocketService.onMessage(
          (messageData) => {
            if (!isMounted.current) return;

            console.log("📨 Received message:", messageData);
            const chatId = messageData.chatId || messageData.groupId;

            if (chatId) {
              setMessages((prev) => {
                const existing = prev[chatId] || [];
                // Check for duplicate messages
                const isDuplicate = existing.some(
                  (msg) =>
                    msg.messageId === messageData.messageId ||
                    (msg.content === messageData.content &&
                      msg.sentAt === messageData.sentAt)
                );

                if (!isDuplicate) {
                  return { ...prev, [chatId]: [...existing, messageData] };
                }
                return prev;
              });

              // Update chat's last activity
              setChats((prev) =>
                prev.map((chat) =>
                  chat.id === chatId
                    ? {
                        ...chat,
                        lastActivity: messageData.sentAt,
                        lastMessage: messageData.content, // ✅ Update lastMessage directly
                      }
                    : chat
                )
              );
            }
          }
        );

        connectionListeners.current = [
          unsubscribeConnection,
          unsubscribeMessages,
        ];

        // Load chats after successful connection
        loadChats();
      } catch (error) {
        if (isMounted.current) {
          console.error("❌ WebSocket initialization failed:", error);
          setError(`Connection failed: ${error.message}`);
          currentSessionRef.current = null;
        }
      }
    };

    initializeConnection();

    // Cleanup on unmount or user change
    return () => {
      isMounted.current = false;

      // Clean up listeners
      connectionListeners.current.forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") unsubscribe();
      });
      connectionListeners.current = [];

      // Only disconnect if this was the active session
      if (currentSessionRef.current === sessionId) {
        console.log("🧹 Cleaning up WebSocket for session:", sessionId);
        webSocketService.disconnect();
        currentSessionRef.current = null;
      }
    };
  }, [isAuthenticated, user, generateSessionId, loadChats]);

  // ✅ SIMPLIFIED: Select a chat (no need to load details separately)
  const selectChat = useCallback(
    async (chat) => {
      if (!chat || !connected || !isMounted.current) return;

      console.log(
        "🎯 Selecting chat (with full details already loaded):",
        chat
      );
      setSelectedChat(chat);

      // ✅ REMOVED: loadChatDetails step - all details are already in chat object

      // ✅ Subscribe to WebSocket topic for this chat
      const subscription = webSocketService.subscribeToChat(
        chat.id,
        chat.isGroup
      );

      if (subscription) {
        console.log(`✅ Subscribed to chat: ${chat.id}`);

        // ✅ Load messages if not already cached
        if (!messages[chat.id]) {
          await loadMessages(chat.id, chat.isGroup, 0);
        }
      } else {
        console.error("❌ Failed to subscribe to chat");
        if (isMounted.current) {
          setError("Failed to join chat");
        }
      }

      return chat; // Return the chat object itself (already has all details)
    },
    [connected, messages, loadMessages, loadChats] // ✅ Removed loadChatDetails dependency
  );

  // ✅ UPDATED: Send a message using receiverEmail from chat object directly
  const sendMessage = useCallback(
    async (content, receiverEmailOverride = null) => {
      if (!selectedChat || !connected || !user || !content.trim()) {
        console.warn("Cannot send message: missing requirements");
        return false;
      }

      setSendingMessage(true);
      try {
        let messageData;

        if (selectedChat.isGroup) {
          // ✅ Group message payload
          messageData = {
            content: content.trim(),
            groupId: selectedChat.id,
            messageType: "TEXT",
          };
        } else {
          // ✅ Direct message payload
          const receiverEmail =
            receiverEmailOverride || selectedChat.receiverEmail;

          messageData = {
            content: content.trim(),
            chatId: selectedChat.id,
            receiverEmail: receiverEmail,
            messageType: "TEXT",
          };
        }

        console.log("📤 Sending message:", messageData);
        const success = webSocketService.sendMessage(messageData);
        return success;
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Failed to send message");
        return false;
      } finally {
        setSendingMessage(false);
        loadChats();
      }
    },
    [selectedChat, connected, user]
  );

  // Create a new personal chat
  const createPersonalChat = useCallback(
    async (receiverEmail) => {
      if (!isMounted.current) return;

      try {
        console.log("👥 Creating personal chat with:", receiverEmail);
        const newChat = await ChatAPI.createPersonalChat(receiverEmail);

        if (!isMounted.current) return;

        console.log("✅ Created personal chat (with full details):", newChat);
        setChats((prev) => [newChat, ...prev]);
        await selectChat(newChat); // ✅ Chat already has all details
        return newChat;
      } catch (err) {
        if (isMounted.current) {
          console.error("Error creating personal chat:", err);
          setError("Failed to create chat");
        }
        throw err;
      }
    },
    [selectChat]
  );

  // Create a new group chat
  const createGroupChat = useCallback(
    async (name, memberEmails = []) => {
      if (!isMounted.current) return;

      try {
        console.log("👨‍👩‍👧‍👦 Creating group chat:", name, memberEmails);
        const newChat = await ChatAPI.createGroupChat(name, memberEmails);

        if (!isMounted.current) return;

        console.log("✅ Created group chat (with full details):", newChat);
        setChats((prev) => [newChat, ...prev]);
        await selectChat(newChat); // ✅ Chat already has all details
        return newChat;
      } catch (err) {
        if (isMounted.current) {
          console.error("Error creating group chat:", err);
          setError("Failed to create group chat");
        }
        throw err;
      }
    },
    [selectChat]
  );

  // Load more messages for pagination
  const loadMoreMessages = useCallback(async () => {
    if (!selectedChat || !isMounted.current) return;

    const pagination = messagePagination[selectedChat.id];
    if (!pagination?.hasMore) return;

    const nextPage = pagination.currentPage + 1;
    await loadMessages(selectedChat.id, selectedChat.isGroup, nextPage);
  }, [selectedChat, messagePagination, loadMessages]);

  // Clear error state
  const clearError = useCallback(() => {
    if (isMounted.current) {
      setError(null);
    }
  }, []);

  // Get current messages and pagination for context
  const currentMessages = selectedChat ? messages[selectedChat.id] || [] : [];
  const currentPagination = selectedChat
    ? messagePagination[selectedChat.id]
    : null;

  // ✅ SIMPLIFIED: Context value provided to all children
  const contextValue = {
    // State
    chats, // ✅ Now includes all details (receiverEmail, lastMessage, etc.)
    selectedChat, // ✅ Already has all details
    // ✅ REMOVED: chatDetails - no longer needed
    messages: currentMessages, // Current chat messages
    allMessages: messages, // All messages by chatId
    loading,
    error,
    connected,
    sendingMessage,
    pagination: currentPagination,

    refreshMessages,

    // Actions
    loadChats,
    refreshChats: loadChats, // Alias for convenience
    selectChat, // ✅ Simplified - no separate details loading
    sendMessage, // ✅ Uses receiverEmail directly from chat
    createPersonalChat,
    createGroupChat,
    loadMoreMessages,
    clearError,
    // ✅ REMOVED: loadChatDetails - no longer needed

    // Current user
    currentUser: user,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
}
