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
  const selectedChatRef = useRef(null);
  // Tracks the latest chats list so WS reconnect can re-subscribe to all topics
  const chatsRef = useRef([]);

  // Generate unique session ID per user to prevent duplicate connections
  const generateSessionId = useCallback((user) => {
    if (!user) return null;
    return `${user.email}-${Date.now()}`;
  }, []);

  const sortByLastActivity = (list) =>
    [...list].sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

  // Load all chats from API and subscribe to all their topics
  const loadChats = useCallback(async () => {
    if (!isAuthenticated || !isMounted.current) return;

    try {
      setLoading(true);
      setError(null);
      const chatsData = await ChatAPI.getAllChats();
      if (isMounted.current) {
        setChats(sortByLastActivity(chatsData));
        chatsRef.current = chatsData;
        // Subscribe to every chat topic so onMessage fires for all chats,
        // enabling real-time unread counts without any backend changes.
        webSocketService.subscribeToAllChats(chatsData);
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

  // const loadMessages = useCallback(
  //   async (chatId, isGroup = false, page = 0) => {
  //     if (!chatId || !isMounted.current) return;

  //     try {
  //       console.log(`📥 Loading messages for chat ${chatId}, page ${page}`);

  //       const messagesData = isGroup
  //         ? await ChatAPI.getMessagesForGroup(chatId, page, 20)
  //         : await ChatAPI.getMessagesForChat(chatId, page, 20);

  //       if (!isMounted.current) return;

  //       console.log("📄 Loaded messages page:", messagesData);

  //       setMessages((prevMessages) => {
  //         const existingMessages = prevMessages[chatId] || [];

  //         if (page === 0) {
  //           // ✅ First page: Replace all messages and REVERSE them
  //           // Since backend sends ASC, we reverse to show newest at bottom
  //           const reversedMessages = [
  //             ...(messagesData.content || []),
  //           ].reverse();
  //           return {
  //             ...prevMessages,
  //             [chatId]: reversedMessages,
  //           };
  //         }

  //         // ✅ Pagination: Prepend older messages to the BEGINNING
  //         // Since we're loading older messages (ASC order), they go at the start
  //         const olderMessages = [...(messagesData.content || [])].reverse();
  //         return {
  //           ...prevMessages,
  //           [chatId]: [...olderMessages, ...existingMessages], // Older messages first
  //         };
  //       });

  //       loadChats(); // Refresh chat list to update last message preview

  //       // Update pagination info
  //       setMessagePagination((prev) => ({
  //         ...prev,
  //         [chatId]: {
  //           currentPage: messagesData.number || 0,
  //           totalPages: messagesData.totalPages || 1,
  //           hasMore: !messagesData.last,
  //           totalElements: messagesData.totalElements || 0,
  //         },
  //       }));

  //       return messagesData;
  //     } catch (err) {
  //       if (isMounted.current) {
  //         console.error("Error loading messages:", err);
  //         setError("Failed to load messages");
  //       }
  //     }
  //   },
  //   [loadChats]
  // );
  const loadMessages = useCallback(
    async (chatId, isGroup = false, beforeMessageId = null) => {
      if (!chatId || !isMounted.current) return;

      try {
        console.log(
          `📥 Loading messages for chat ${chatId}, cursor:`,
          beforeMessageId
        );

        // 🔹 Call cursor-based API
        const messagesData = isGroup
          ? await ChatAPI.getMessagesCursorForGroup(chatId, beforeMessageId, 20)
          : await ChatAPI.getMessagesCursorForChat(chatId, beforeMessageId, 20);

        if (!isMounted.current) return;

        console.log("📄 Loaded messages batch:", messagesData);

        const batch = messagesData.messages || [];

        setMessages((prevMessages) => {
          const existingMessages = prevMessages[chatId] || [];

          // 🔹 Decide how to merge based on cursor
          let merged;
          if (!beforeMessageId) {
            // First load: only this batch
            merged = batch;
          } else {
            // Older messages: prepend before existing
            merged = [...batch, ...existingMessages];
          }

          // 🔹 Deduplicate by messageId (or fallback to id)
          const seen = new Set();
          const deduped = [];

          for (const msg of merged) {
            const key = msg.messageId || msg.id; // important!
            if (key && seen.has(key)) continue;
            if (key) seen.add(key);
            deduped.push(msg);
          }

          return {
            ...prevMessages,
            [chatId]: deduped,
          };
        });

        // ✅ Save cursor-based pagination info per chat
        setMessagePagination((prev) => ({
          ...prev,
          [chatId]: {
            hasMore: !!messagesData.hasMore,
            cursor: messagesData.nextCursor || null, // UUID of oldest in this batch
          },
        }));

        return messagesData;
      } catch (err) {
        if (isMounted.current) {
          console.error("Error loading messages:", err);
          // Don't setError globally — message failures shouldn't replace the chat list
        }
      }
    },
    []
  );

  // const refreshMessages = useCallback(
  //   async (chatId, isGroup = false) => {
  //     if (!chatId || !isMounted.current) return;

  //     console.log(`🔄 Refreshing messages for chat ${chatId}`);
  //     await loadMessages(chatId, isGroup, 0); // Reload page 0 (latest messages)
  //   },
  //   [loadMessages]
  // );
  const refreshMessages = useCallback(
    async (chatId, isGroup = false) => {
      if (!chatId || !isMounted.current) return;

      console.log(`🔄 Refreshing messages for chat ${chatId}`);
      // 🔹 Initial load = no cursor
      await loadMessages(chatId, isGroup, null);
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

        // Connection listener — on reconnect, re-subscribe to all known chat topics
        const unsubscribeConnection = webSocketService.onConnectionChange(
          (isConnected) => {
            if (!isMounted.current) return;
            console.log(`🔌 WebSocket status: ${isConnected ? "Connected" : "Disconnected"}`);
            setConnected(isConnected);
            if (isConnected && chatsRef.current.length > 0) {
              // Re-subscribe to all chats so onMessage keeps firing after a reconnect
              webSocketService.subscribeToAllChats(chatsRef.current);
            }
          }
        );

        // Single message handler — covers both "show in chat area" and "unread badge"
        const unsubscribeMessages = webSocketService.onMessage(
          (messageData) => {
            if (!isMounted.current) return;
            const chatId = messageData.chatId || messageData.groupId;
            if (!chatId) return;

            // Append message to the relevant chat's message list
            setMessages((prev) => {
              const existing = prev[chatId] || [];
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

            // Update the chat card: sort to top + set lastMessage.
            // If chat is currently open → keep unreadCount at 0.
            // If chat is in the background → increment unreadCount.
            const isActive = selectedChatRef.current?.id === chatId;
            setChats((prev) =>
              sortByLastActivity(
                prev.map((chat) =>
                  chat.id === chatId
                    ? {
                        ...chat,
                        lastActivity: messageData.sentAt,
                        lastMessage: messageData.content,
                        unreadCount: isActive
                          ? 0
                          : (chat.unreadCount || 0) + 1,
                      }
                    : chat
                )
              )
            );
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
  // const selectChat = useCallback(
  //   async (chat) => {
  //     if (!chat || !connected || !isMounted.current) return;

  //     console.log(
  //       "🎯 Selecting chat (with full details already loaded):",
  //       chat
  //     );
  //     setSelectedChat(chat);

  //     // ✅ REMOVED: loadChatDetails step - all details are already in chat object

  //     // ✅ Subscribe to WebSocket topic for this chat
  //     const subscription = webSocketService.subscribeToChat(
  //       chat.id,
  //       chat.isGroup
  //     );

  //     if (subscription) {
  //       console.log(`✅ Subscribed to chat: ${chat.id}`);

  //       // ✅ Load messages if not already cached
  //       if (!messages[chat.id]) {
  //         await loadMessages(chat.id, chat.isGroup, 0);
  //       }
  //     } else {
  //       console.error("❌ Failed to subscribe to chat");
  //       if (isMounted.current) {
  //         setError("Failed to join chat");
  //       }
  //     }

  //     return chat; // Return the chat object itself (already has all details)
  //   },
  //   [connected, messages, loadMessages] // ✅ Removed loadChatDetails dependency
  // );

  const selectChat = useCallback(
    async (chat) => {
      if (!chat || !isMounted.current) return;

      setSelectedChat(chat);
      selectedChatRef.current = chat;

      // Clear unread badge immediately on open
      setChats((prev) =>
        prev.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c))
      );

      // Ensure subscribed (loadChats already subscribes all, but guard for new chats)
      if (webSocketService.isConnected()) {
        webSocketService.subscribeToChat(chat.id, chat.isGroup);
      }

      // Load message history if not already cached
      if (!messages[chat.id]) {
        await loadMessages(chat.id, chat.isGroup, null);
      }

      return chat;
    },
    [messages, loadMessages]
  );

  // Background refresh every 10 s — syncs unread counts + last messages from DB.
  // Silent: no loading spinner. Takes the MAX of server vs. client unread count
  // so WebSocket-driven increments are never lost due to API lag.
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(async () => {
      if (!isMounted.current || !isAuthenticated) return;
      try {
        const chatsData = await ChatAPI.getAllChats();
        if (!isMounted.current) return;
        const activeChatId = selectedChatRef.current?.id;
        setChats((prev) => {
          const prevMap = new Map(prev.map((c) => [c.id, c]));
          return sortByLastActivity(
            chatsData.map((fresh) => {
              const cached = prevMap.get(fresh.id);
              return {
                ...fresh,
                // Active chat is always 0; others keep the higher of server vs. client
                unreadCount:
                  fresh.id === activeChatId
                    ? 0
                    : Math.max(
                        fresh.unreadCount || 0,
                        cached?.unreadCount || 0
                      ),
              };
            })
          );
        });
        chatsRef.current = chatsData;
        webSocketService.subscribeToAllChats(chatsData);
      } catch {
        // silent — don't show errors for background refreshes
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // ✅ UPDATED: Send a message using receiverEmail from chat object directly
  const sendMessage = useCallback(
    async (content, receiverEmailOverride = null, replyToId = null) => {
      if (!selectedChat || !connected || !user || !content.trim()) {
        console.warn("Cannot send message: missing requirements");
        return false;
      }

      setSendingMessage(true);
      try {
        let messageData;

        if (selectedChat.isGroup) {
          messageData = {
            content: content.trim(),
            groupId: selectedChat.id,
            messageType: "TEXT",
            ...(replyToId && { replyToId }),
          };
        } else {
          const receiverEmail =
            receiverEmailOverride || selectedChat.receiverEmail;

          messageData = {
            content: content.trim(),
            chatId: selectedChat.id,
            receiverEmail: receiverEmail,
            messageType: "TEXT",
            ...(replyToId && { replyToId }),
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
        chatsRef.current = [newChat, ...chatsRef.current];
        // Subscribe to this new chat's topic immediately
        webSocketService.subscribeToChat(newChat.id, false);
        await selectChat(newChat);
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
        chatsRef.current = [newChat, ...chatsRef.current];
        // Subscribe to this new group's topic immediately
        webSocketService.subscribeToChat(newChat.id, true);
        await selectChat(newChat);
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
  // const loadMoreMessages = useCallback(async () => {
  //   if (!selectedChat || !isMounted.current) return;

  //   const pagination = messagePagination[selectedChat.id];
  //   console.log("loadMoreMessages called. Pagination:", pagination);

  //   if (!pagination?.hasMore) {
  //     console.log("❌ No more pages to load");
  //     return;
  //   }

  //   const nextPage = pagination.currentPage + 1;
  //   console.log("➡️ Loading page:", nextPage);
  //   await loadMessages(selectedChat.id, selectedChat.isGroup, nextPage);
  // }, [selectedChat, messagePagination, loadMessages]);

  const loadMoreMessages = useCallback(async () => {
    if (!selectedChat || !isMounted.current) return;

    const pagination = messagePagination[selectedChat.id];
    console.log("loadMoreMessages called. Pagination:", pagination);

    if (!pagination?.hasMore) {
      console.log("❌ No more messages to load (hasMore=false)");
      return;
    }

    const cursor = pagination.cursor;
    if (!cursor) {
      console.log("❌ No cursor available for this chat");
      return;
    }

    console.log("➡️ Loading older messages before cursor:", cursor);
    await loadMessages(selectedChat.id, selectedChat.isGroup, cursor);
  }, [selectedChat, messagePagination, loadMessages]);

  const leaveGroup = useCallback(
    async (groupId) => {
      if (!isAuthenticated || !isMounted.current) return;

      try {
        console.log("🚪 Leaving group:", groupId);

        // Call the API to leave the group
        const response = await ChatAPI.leaveGroup(groupId);

        if (!isMounted.current) return;

        console.log("✅ Successfully left group:", response);

        // Remove the group from chats list and unsubscribe from its topic
        webSocketService.unsubscribeFromChat(groupId);
        chatsRef.current = chatsRef.current.filter((c) => c.id !== groupId);
        setChats((prev) => prev.filter((chat) => chat.id !== groupId));

        // Clear messages for this group
        setMessages((prev) => {
          const newMessages = { ...prev };
          delete newMessages[groupId];
          return newMessages;
        });

        // Clear pagination info
        setMessagePagination((prev) => {
          const newPagination = { ...prev };
          delete newPagination[groupId];
          return newPagination;
        });

        // If this was the selected chat, clear selection
        if (selectedChat?.id === groupId) {
          setSelectedChat(null);
          selectedChatRef.current = null;
        }

        // Refresh chats to get updated list
        await loadChats();

        return response;
      } catch (err) {
        if (isMounted.current) {
          console.error("Error leaving group:", err);
          setError("Failed to leave group");
        }
        throw err;
      }
    },
    [isAuthenticated, selectedChat, loadChats]
  );

  const editMessage = useCallback(
    async (messageId, newContent) => {
      const updated = await ChatAPI.editMessage(messageId, newContent);
      // Patch the message in local state so the UI updates immediately
      setMessages((prev) => {
        const chatId = updated.chatId || updated.groupId;
        if (!chatId || !prev[chatId]) return prev;
        return {
          ...prev,
          [chatId]: prev[chatId].map((m) =>
            (m.messageId || m.id) === updated.messageId ? { ...m, content: updated.content, edited: true } : m
          ),
        };
      });
      return updated;
    },
    []
  );

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

    leaveGroup,
    editMessage,

    // Current user
    currentUser: user,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
}
