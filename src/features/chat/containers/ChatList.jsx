// chat/containers/ChatList.jsx - FIXED: Multiple issues
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useChat } from "../hooks/useChat";

const ChatList = ({
  currentUserId,
  activeChat,
  activeSection,
  onChatSelect,
  onNewChat,
  onLogout,
  user,
  loadChats,
  className = "",
}) => {
  // ✅ Use filtered chats based on active section
  const { chats, loading, error, refreshChats, chatCounts } = useChat(
    null,
    activeSection
  );

  // ✅ FIXED: Handle new chat creation with proper parameter forwarding
  const handleNewChat = async (
    emailOrName,
    isGroup = false,
    memberEmails = []
  ) => {
    console.log("ChatList handleNewChat:", {
      emailOrName,
      isGroup,
      memberEmails,
    });
    try {
      // ✅ FIX: Forward all parameters correctly to Dashboard
      await onNewChat(emailOrName, isGroup, memberEmails);
    } catch (error) {
      console.error("ChatList: Failed to create chat:", error);
      // Re-throw to let the modal handle the error display
      throw error;
    }
  };

  // Handle chat selection
  const handleChatSelect = (chat) => {
    onChatSelect?.(chat);
    refreshChats();
    // loadChats(); // Refresh chat list to update last message preview
  };

  // Handle logout
  const handleLogout = () => {
    onLogout?.();
  };

  // ✅ Get section title and empty state message
  const getSectionInfo = () => {
    switch (activeSection) {
      case "direct":
        return {
          title: "Direct Messages",
          emptyMessage: "No direct messages yet",
          buttonText: "Start Direct Message",
        };
      case "groups":
        return {
          title: "Groups",
          emptyMessage: "No groups yet",
          buttonText: "Create Group",
        };
      default:
        return {
          title: "All Chats",
          emptyMessage: "No chats yet",
          buttonText: "New Chat",
        };
    }
  };

  const sectionInfo = getSectionInfo();

  if (loading && chats.length === 0) {
    return (
      <div
        className={`h-full bg-gray-900 border-r border-gray-700 flex flex-col ${className}`}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-gray-400">
              Loading {sectionInfo.title.toLowerCase()}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`h-full bg-gray-900 border-r border-gray-700 flex flex-col ${className}`}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-red-600 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-white font-medium mb-2">
              Failed to load {sectionInfo.title.toLowerCase()}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              There was an error loading your conversations
            </p>
            <button
              onClick={refreshChats}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <Sidebar
        chats={chats}
        currentUserId={currentUserId}
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat} // ✅ Pass the fixed handler
        user={user}
        onLogout={onLogout}
        activeSection={activeSection}
        className="flex-1"
      />
    </div>
  );
};

export default ChatList;
