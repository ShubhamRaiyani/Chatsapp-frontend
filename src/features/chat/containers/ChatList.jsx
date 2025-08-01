// chat/containers/ChatList.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useChat } from "../hooks/useChat";

const ChatList = ({
  currentUserId,
  activeChat,
  activeSection, // ✅ Receive active section
  onChatSelect,
  onNewChat,
  onLogout,
  user,
  className = "",
}) => {
  // ✅ Use filtered chats based on active section
  const {
    chats, // Already filtered by section
    loading,
    error,
    refreshChats,
    chatCounts,
  } = useChat(null, activeSection);

  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Filter chats based on search query (already filtered by section)
  const filteredChats = chats.filter((chat) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    if (chat.isGroup) {
      return (
        chat.displayName?.toLowerCase().includes(query) ||
        chat.name?.toLowerCase().includes(query)
      );
    } else {
      // For direct chats, search in participants
      const participant = chat.participants?.find(
        (p) => p.id !== currentUserId
      );
      return (
        participant?.displayName?.toLowerCase().includes(query) ||
        participant?.email?.toLowerCase().includes(query) ||
        participant?.username?.toLowerCase().includes(query)
      );
    }
  });

  // Handle new chat creation
  const handleNewChat = () => {
    console.log(
      `Creating new ${activeSection === "groups" ? "group" : "chat"}...`
    );
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
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshChats]);

  // Clear search when section changes
  useEffect(() => {
    setSearchQuery("");
  }, [activeSection]);

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
      <div className={`h-full w-full flex flex-col ${className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
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
      <div className={`h-full w-full flex flex-col ${className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-2">
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-400 mb-4">
              Failed to load {sectionInfo.title.toLowerCase()}
            </p>
            <button
              onClick={refreshChats}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full w-full flex flex-col overflow-hidden ${className}`}>
      {/* Section Header */}
      <div className="shrink-0 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-semibold text-white">
            {sectionInfo.title}
          </h1>
          <span className="text-sm text-gray-400">
            ({filteredChats.length})
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${sectionInfo.title.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Chat List or Empty State */}
      {filteredChats.length === 0 && !loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-gray-400 mb-4">{sectionInfo.emptyMessage}</p>
            <button
              onClick={handleNewChat}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {sectionInfo.buttonText}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <Sidebar
            chats={filteredChats}
            activeChat={activeChat}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
            onLogout={handleLogout}
            user={user}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sectionType={activeSection} // ✅ Pass section type to Sidebar
          />
        </div>
      )}
    </div>
  );
};

export default ChatList;
