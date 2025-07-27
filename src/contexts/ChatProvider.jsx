// src/contexts/ChatProvider.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import ChatContext from "./ChatContext";

// Create ChatContext
// const ChatContext = createContext(null);


/**
 * ChatProvider: Wraps your app/chat pages to provide chat state and methods.
 */
export function ChatProvider({ children }) {
  // Chat type: "oneToOne" or "group"
  const [chatType, setChatType] = useState("oneToOne");

  // Chat list of current chatType
  const [chatList, setChatList] = useState([]);

  // Currently selected chat (an object with id, type, displayName, etc.)
  const [selectedChat, setSelectedChat] = useState(null);

  // Messages in the selected chat
  const [messages, setMessages] = useState([]);

  // Typing indicator state (expandable)
  const [typing, setTyping] = useState(false);

  // Load chats when chatType changes - replace with your API calls
  useEffect(() => {
    // Dummy chats for demo - replace with API fetching
    const fetchChats = () => {
      if (chatType === "oneToOne") {
        setChatList([
          {
            id: "chat1",
            type: "oneToOne",
            displayName: "Alice",
            lastMessage: "Hey there!",
            lastTimestamp: "10:15 AM",
          },
          {
            id: "chat2",
            type: "oneToOne",
            displayName: "Bob",
            lastMessage: "Ready for tomorrow?",
            lastTimestamp: "Yesterday",
          },
        ]);
      } else {
        setChatList([
          {
            id: "grp1",
            type: "group",
            displayName: "Project Team",
            lastMessage: "Meeting at 3pm",
            lastTimestamp: "Today 9:00 AM",
          },
          {
            id: "grp2",
            type: "group",
            displayName: "Friends",
            lastMessage: "Movie night?",
            lastTimestamp: "Yesterday",
          },
        ]);
      }
      setSelectedChat(null);
      setMessages([]);
    };

    fetchChats();
  }, [chatType]);

  // Load messages when selectedChat changes - replace with your API calls
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    // Dummy messages for demo
    const fetchMessages = () => {
      if (selectedChat.type === "oneToOne") {
        setMessages([
          {
            id: "m1",
            sender: selectedChat.displayName,
            content: "Hello, how are you?",
            timestamp: "10:00 AM",
          },
          {
            id: "m2",
            sender: "Me",
            content: "I'm good! Thanks for asking.",
            timestamp: "10:01 AM",
          },
        ]);
      } else {
        setMessages([
          {
            id: "m1",
            sender: "Alice",
            content: "The deadline is next week.",
            timestamp: "Yesterday 5:00 PM",
          },
          {
            id: "m2",
            sender: "Bob",
            content: "Thanks for the reminder!",
            timestamp: "Yesterday 5:05 PM",
          },
        ]);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  /**
   * Send a message in the current chat
   * @param {string} content Message content
   */
  const sendMessage = useCallback(
    (content) => {
      if (!selectedChat) return;

      // Create new message object
      const newMessage = {
        id: `m${Date.now()}`,
        sender: "Me", // Or get from user context
        content,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Update messages (in real app, publish to backend or socket)
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // TODO: send message to backend API or websocket
    },
    [selectedChat]
  );

  /**
   * Dummy function to get AI summary of the chat messages.
   * Replace with real AI integration.
   */
  const getAISummary = useCallback(() => {
    if (messages.length === 0) {
      alert("No messages to summarize.");
      return;
    }
    const summary = messages.map((m) => m.content).join(" ");
    alert(`AI Summary:\n${summary}`);
  }, [messages]);

  const value = {
    chatType,
    setChatType,
    chatList,
    selectedChat,
    setSelectedChat,
    messages,
    sendMessage,
    getAISummary,
    typing,
    setTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
