// features/chat/contexts/ChatProvider.jsx - Add mounting guards
import React, { useState, useEffect, useCallback, useRef } from "react";
import ChatContext from "./ChatContext";
import ChatAPI from "../services/ChatAPI";
import webSocketService from "../services/WebSocketService";
import { useAuth } from "../../auth";

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messagePagination, setMessagePagination] = useState({});

  const { user, isAuthenticated } = useAuth();

  // Component lifecycle tracking
  const isMounted = useRef(true);
  const isInitialized = useRef(false);
  const connectionListeners = useRef([]);

  // Stable user reference to prevent unnecessary re-renders
  const stableUser = useRef(user);
  const stableAuthState = useRef(isAuthenticated);

  useEffect(() => {
    stableUser.current = user;
    stableAuthState.current = isAuthenticated;
  }, [user, isAuthenticated]);

  // Load chats function - stable reference
  const loadChats = useCallback(async () => {
    if (!stableAuthState.current || !isMounted.current) return;

    try {
      setLoading(true);
      setError(null);
      const chatsData = await ChatAPI.getAllChats();

      if (isMounted.current) {
        console.log("📋 Loaded chats:", chatsData);
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
  }, []); // Empty deps - uses refs for stable values

  // WebSocket initialization - runs only once per component lifecycle
  useEffect(() => {
    isMounted.current = true;

    // Prevent multiple initializations
    if (!isAuthenticated || !user || isInitialized.current) {
      return;
    }

    const initializeWebSocket = async () => {
      if (!isMounted.current) return;

      try {
        console.log("🚀 Initializing WebSocket connection...");
        isInitialized.current = true;

        const token =
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("authToken");

        await webSocketService.connect(token);

        if (!isMounted.current) return;

        console.log("✅ WebSocket connection established");

        const unsubscribeConnection = webSocketService.onConnectionChange(
          (isConnected) => {
            if (isMounted.current) {
              console.log(
                `🔌 WebSocket connection status: ${
                  isConnected ? "Connected" : "Disconnected"
                }`
              );
              setConnected(isConnected);
            }
          }
        );

        const unsubscribeMessages = webSocketService.onMessage(
          (messageData) => {
            if (!isMounted.current) return;

            console.log("📨 Received message from WebSocket:", messageData);

            const chatId = messageData.chatId || messageData.groupId;
            if (chatId) {
              setMessages((prevMessages) => {
                const chatMessages = prevMessages[chatId] || [];
                const existingMessageIndex = chatMessages.findIndex(
                  (msg) => msg.messageId === messageData.messageId
                );

                if (existingMessageIndex === -1) {
                  return {
                    ...prevMessages,
                    [chatId]: [messageData, ...chatMessages],
                  };
                }
                return prevMessages;
              });

              setChats((prevChats) =>
                prevChats.map((chat) =>
                  chat.id === chatId
                    ? { ...chat, lastActivity: messageData.sentAt }
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

        // Load chats after WebSocket is set up
        loadChats();
      } catch (error) {
        if (isMounted.current) {
          console.error("❌ Failed to initialize WebSocket:", error);
          setError("Failed to connect to chat service");
          isInitialized.current = false;
        }
      }
    };

    initializeWebSocket();

    // Cleanup only on component unmount
    return () => {
      isMounted.current = false;

      if (isInitialized.current) {
        console.log("🧹 Cleaning up WebSocket connection");

        connectionListeners.current.forEach((unsubscribe) => {
          if (typeof unsubscribe === "function") {
            unsubscribe();
          }
        });
        connectionListeners.current = [];

        // Only disconnect if this is the last provider instance
        webSocketService.disconnect();
        isInitialized.current = false;
      }
    };
  }, []); // Empty deps - only run once per component lifecycle

  // Rest of your methods remain the same...
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
            return { ...prevMessages, [chatId]: messagesData.content };
          }
          return {
            ...prevMessages,
            [chatId]: [...existingMessages, ...messagesData.content],
          };
        });

        setMessagePagination((prev) => ({
          ...prev,
          [chatId]: {
            currentPage: messagesData.number,
            totalPages: messagesData.totalPages,
            hasMore: !messagesData.last,
            totalElements: messagesData.totalElements,
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

  // Your other methods remain exactly the same...
  const selectChat = useCallback(
    async (chat) => {
      if (!chat || !connected || !isMounted.current) return;

      console.log("🎯 Selecting chat:", chat);
      setSelectedChat(chat);

      const subscription = webSocketService.subscribeToChat(
        chat.id,
        chat.isGroup
      );
      if (subscription) {
        console.log(`✅ Subscribed to chat: ${chat.id}`);
        await loadMessages(chat.id, chat.isGroup, 0);
      } else {
        console.error("❌ Failed to subscribe to chat");
        if (isMounted.current) {
          setError("Failed to join chat");
        }
      }
    },
    [connected, loadMessages]
  );

  const sendMessage = useCallback(
    async (content, receiverEmail) => {
      if (
        !selectedChat ||
        !connected ||
        !stableUser.current ||
        !content.trim() ||
        !isMounted.current
      ) {
        console.warn("Cannot send message: missing requirements");
        return false;
      }

      setSendingMessage(true);
      try {
        const messageData = {
          content: content.trim(),
          senderEmail: stableUser.current.email,
          receiverEmail: receiverEmail,
          chatId: selectedChat.isGroup ? null : selectedChat.id,
          groupId: selectedChat.isGroup ? selectedChat.id : null,
          messageType: "TEXT",
        };

        console.log("📤 Sending message:", messageData);
        const success = webSocketService.sendMessage(messageData);

        if (success) {
          console.log("✅ Message sent successfully");
          return true;
        } else {
          throw new Error("WebSocket send failed");
        }
      } catch (err) {
        if (isMounted.current) {
          console.error("Error sending message:", err);
          setError("Failed to send message");
        }
        return false;
      } finally {
        if (isMounted.current) {
          setSendingMessage(false);
        }
      }
    },
    [selectedChat, connected]
  );

  const createPersonalChat = useCallback(
    async (receiverEmail) => {
      if (!isMounted.current) return;

      try {
        console.log("👥 Creating personal chat with:", receiverEmail);
        const newChat = await ChatAPI.createPersonalChat(receiverEmail);

        if (!isMounted.current) return;

        console.log("✅ Created personal chat:", newChat);
        setChats((prevChats) => [newChat, ...prevChats]);
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

  const createGroupChat = useCallback(
    async (name, memberEmails = []) => {
      if (!isMounted.current) return;

      try {
        console.log("👨‍👩‍👧‍👦 Creating group chat:", name, memberEmails);
        const newChat = await ChatAPI.createGroupChat(name, memberEmails);

        if (!isMounted.current) return;

        console.log("✅ Created group chat:", newChat);
        setChats((prevChats) => [newChat, ...prevChats]);
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

  const loadMoreMessages = useCallback(async () => {
    if (!selectedChat || !isMounted.current) return;

    const pagination = messagePagination[selectedChat.id];
    if (!pagination?.hasMore) return;

    const nextPage = pagination.currentPage + 1;
    await loadMessages(selectedChat.id, selectedChat.isGroup, nextPage);
  }, [selectedChat, messagePagination, loadMessages]);

  const clearError = useCallback(() => {
    if (isMounted.current) {
      setError(null);
    }
  }, []);

  const currentMessages = selectedChat ? messages[selectedChat.id] || [] : [];
  const currentPagination = selectedChat
    ? messagePagination[selectedChat.id]
    : null;

  const contextValue = {
    chats,
    selectedChat,
    messages: currentMessages,
    loading,
    error,
    connected,
    sendingMessage,
    pagination: currentPagination,
    loadChats,
    refreshChats: loadChats,
    selectChat,
    sendMessage,
    createPersonalChat,
    createGroupChat,
    loadMoreMessages,
    clearError,
    currentUser: stableUser.current,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
}
