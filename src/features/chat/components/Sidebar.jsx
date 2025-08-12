// chat/components/Sidebar.jsx - FIXED: Parameter handling and debugging
import React, { useState } from "react";
import ChatCard from "./ChatCard";
import NewChatModal from "./NewChatModal";

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
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // Filter chats based on search and active section
  const filteredChats = chats.filter((chat) => {
    // First filter by search query
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (chat.isGroup) {
        matchesSearch = chat.displayName?.toLowerCase().includes(query);
      } else {
        matchesSearch = chat.displayName?.toLowerCase().includes(query);
      }
    }

    // Then filter by active section
    let matchesSection = true;
    switch (activeSection) {
      case "direct":
        matchesSection = !chat.isGroup;
        break;
      case "groups":
        matchesSection = chat.isGroup;
        break;
      case "archived":
        matchesSection = chat.archived === true;
        break;
      case "starred":
        matchesSection = chat.starred === true;
        break;
      case "chats":
      default:
        matchesSection = !chat.archived;
        break;
    }

    return matchesSearch && matchesSection;
  });

  const getSectionTitle = () => {
    switch (activeSection) {
      case "direct":
        return "Direct Messages";
      case "groups":
        return "Groups";
      case "archived":
        return "Archived Chats";
      case "starred":
        return "Starred Messages";
      case "chats":
      default:
        return "All Chats";
    }
  };

  // ✅ FIXED: Handle direct chat creation with proper debugging
  const handleCreateChat = async (receiverEmail) => {
    console.log("Sidebar handleCreateChat called with:", receiverEmail);

    if (isCreatingChat) return;

    setIsCreatingChat(true);
    try {
      // ✅ FIX: Pass parameters in correct order and format
      console.log("Sidebar calling onNewChat with:", receiverEmail, false, []);
      await onNewChat(receiverEmail, false, []); // receiverEmail, isGroup=false, memberEmails=[]
    } catch (error) {
      console.error("Sidebar: Failed to create direct chat:", error);
      // Error handling is done in the modal
      throw error; // Re-throw to let modal handle
    } finally {
      setIsCreatingChat(false);
    }
  };

  // ✅ FIXED: Handle group creation with proper debugging
  const handleCreateGroup = async (groupName, memberEmails) => {
    console.log(
      "Sidebar handleCreateGroup called with:",
      groupName,
      memberEmails
    );

    if (isCreatingChat) return;

    setIsCreatingChat(true);
    try {
      // ✅ FIX: Pass parameters in correct order
      console.log(
        "Sidebar calling onNewChat with:",
        groupName,
        true,
        memberEmails
      );
      await onNewChat(groupName, true, memberEmails); // groupName, isGroup=true, memberEmails
    } catch (error) {
      console.error("Sidebar: Failed to create group:", error);
      // Error handling is done in the modal
      throw error; // Re-throw to let modal handle
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <div
      className={`h-full bg-gray-900 border-r border-gray-700 flex flex-col ${className}`}
    >
      {/* Header Section */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 rounded-lg flex-shrink-0">
              {activeSection === "groups" ? (
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.196-2.121M12 14h.01M12 14h.01M12 14h.01M12 14a4 4 0 00-8 0v2h8v-2z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-white"
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
            <div>
              <h2 className="text-white font-semibold text-lg">
                {getSectionTitle()}
              </h2>
              <p className="text-gray-400 text-sm">
                {filteredChats.length}{" "}
                {filteredChats.length === 1 ? "conversation" : "conversations"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNewChatModal(true)}
            disabled={isCreatingChat}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            title={activeSection === "groups" ? "Create Group" : "New Chat"}
          >
            {isCreatingChat ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
            ) : (
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${getSectionTitle().toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 text-white placeholder-gray-400 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-gray-700 transition-colors"
            disabled={isCreatingChat}
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
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

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
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
            <h3 className="text-white font-medium mb-2">
              {searchQuery
                ? "No results found"
                : `No ${getSectionTitle().toLowerCase()} yet`}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {searchQuery
                ? "Try adjusting your search terms"
                : `Start a new ${
                    activeSection === "groups" ? "group" : "conversation"
                  } to see it here`}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowNewChatModal(true)}
                disabled={isCreatingChat}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isCreatingChat ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : activeSection === "groups" ? (
                  "Create Group"
                ) : (
                  "New Chat"
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredChats.map((chat) => (
              <ChatCard
                key={chat.id}
                chat={chat}
                isActive={activeChat?.id === chat.id}
                onClick={() => onChatSelect(chat)}
                currentUserId={currentUserId}
                className="hover:bg-gray-800 transition-colors"
              />
            ))}
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onCreateChat={handleCreateChat} // ✅ Pass email string to create direct chat
        onCreateGroup={handleCreateGroup} // ✅ Pass name and emails to create group
        activeSection={activeSection}
      />
    </div>
  );
};

export default Sidebar;
