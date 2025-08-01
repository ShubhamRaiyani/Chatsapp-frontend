// chat/components/Sidebar.jsx - Dark Theme Redesign
import React, { useState } from "react";
import ChatCard from "./ChatCard";
import Avatar from "./ui/Avatar";

const Sidebar = ({
  chats = [],
  currentUserId,
  activeChat,
  onChatSelect,
  onNewChat,
  user,
  activeSection = "chats",
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter chats based on search and active section
  const filteredChats = chats.filter((chat) => {
    // First filter by search query
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (chat.type === "group") {
        matchesSearch = chat.name?.toLowerCase().includes(query);
      } else {
        matchesSearch = chat.participants?.[0]?.name
          ?.toLowerCase()
          .includes(query);
      }
    }

    // Then filter by active section
    let matchesSection = true;
    switch (activeSection) {
      case "direct":
        matchesSection = chat.type === "direct";
        break;
      case "groups":
        matchesSection = chat.type === "group";
        break;
      case "archived":
        matchesSection = chat.archived === true;
        break;
      case "starred":
        matchesSection = chat.starred === true;
        break;
      case "chats":
      default:
        matchesSection = !chat.archived; // Show all non-archived chats
        break;
    }

    return matchesSearch && matchesSection;
  });

  const pinnedChats = filteredChats.filter((chat) => chat.pinned);
  const regularChats = chats;

  const getSectionTitle = () => {
    switch (activeSection) {
      case "direct":
        return "Direct Messages";
      case "groups":
        return "Group Chats";
      case "archived":
        return "Archived Chats";
      case "starred":
        return "Starred Messages";
      case "chats":
      default:
        return "All Chats";
    }
  };

  return (
    <div
      className={`flex flex-col h-full bg-[#1A1A1A] border-r border-[#262626] ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#262626]">
        <div>
          <h2 className="text-xl font-bold text-white">{getSectionTitle()}</h2>
          <p className="text-sm text-gray-400">
            {filteredChats.length}{" "}
            {filteredChats.length === 1 ? "conversation" : "conversations"}
          </p>
        </div>
        <button
          onClick={onNewChat}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#262626] rounded-xl transition-colors"
          title="New chat"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-[#262626]">
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${getSectionTitle().toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#262626] border border-[#404040] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#404040] scrollbar-track-transparent">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 px-6">
            <div className="w-16 h-16 bg-[#262626] rounded-2xl flex items-center justify-center mb-4">
              {searchQuery ? (
                <svg
                  className="w-8 h-8"
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
              ) : (
                <svg
                  className="w-8 h-8"
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
              )}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchQuery
                ? "No chats found"
                : `No ${getSectionTitle().toLowerCase()} yet`}
            </h3>
            <p className="text-sm text-center">
              {searchQuery
                ? "Try adjusting your search terms"
                : `Start a new conversation to see it here`}
            </p>
            {!searchQuery && (
              <button
                onClick={onNewChat}
                className="mt-4 px-4 py-2 bg-[#7C3AED] text-white rounded-xl hover:bg-[#8B5CF6] transition-colors"
              >
                Start New Chat
              </button>
            )}
          </div>
        ) : (
          <div className="py-2">
            {/* Pinned Chats */}
            {pinnedChats.length > 0 && (
              <div className="mb-4">
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                  </svg>
                  <span>Pinned</span>
                </div>
                {pinnedChats.map((chat) => (
                  <ChatCard
                    key={chat.id}
                    chat={chat}
                    isActive={activeChat?.id === chat.id}
                    onClick={() => onChatSelect?.(chat)}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}

            {/* Regular Chats */}
            {regularChats.length > 0 && (
              <div>
                {pinnedChats.length > 0 && (
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Recent
                  </div>
                )}
                {regularChats.map((chat) => (
                  <ChatCard
                    key={chat.id}
                    chat={chat}
                    isActive={activeChat?.id === chat.id}
                    onClick={() => onChatSelect?.(chat)}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connection Status */}
      <div className="p-4 border-t border-[#262626] bg-[#0F0F0F]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Connected</span>
          </div>
          <div className="text-xs text-gray-500">{user?.name || "User"}</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
