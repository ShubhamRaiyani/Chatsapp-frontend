// chat/containers/ChatList.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useChat } from "../hooks/useChat";

const ChatList = ({
  currentUserId,
  activeChat,
  onChatSelect,
  onNewChat,
  onLogout,
  user,
  className = "",
}) => {
  const { chats, loading, error, refreshChats } = useChat();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter chats based on search query
  const filteredChats = chats.filter((chat) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();

    if (chat.type === "group") {
      return chat.name?.toLowerCase().includes(query);
    } else {
      return chat.participants?.[0]?.name?.toLowerCase().includes(query);
    }
  });

  // Handle new chat creation
  const handleNewChat = () => {
    // This could open a modal to select contacts or create group
    console.log("Creating new chat...");
    onNewChat?.();
  };

  // Handle chat selection
  const handleChatSelect = (chat) => {
    onChatSelect?.(chat);
  };

  // Handle logout
  const handleLogout = () => {
    onLogout?.();
  };

  // Refresh chats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshChats();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refreshChats]);

  if (loading && chats.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c.094 0 .174-.004.256-.008C19.637 19.001 20 18.638 20 18.175V5.825c0-.463-.363-.826-.826-.826H4.826C4.363 4.999 4 5.362 4 5.825v12.35c0 .463.363.826.826.826z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">Failed to load chats</p>
          <button
            onClick={refreshChats}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <Sidebar
      chats={filteredChats}
      currentUserId={currentUserId}
      activeChat={activeChat}
      onChatSelect={handleChatSelect}
      onNewChat={handleNewChat}
      onLogout={handleLogout}
      user={user}
      className={className}
    />
  );
};

export default ChatList;
