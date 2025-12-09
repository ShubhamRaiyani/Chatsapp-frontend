// chat/components/Sidebar.jsx - Mobile Responsive Version
import React, { useState, useEffect } from "react";
import ChatCard from "./ChatCard";
import NewChatModal from "./NewChatModal";
import Avatar from "./ui/Avatar";
import ProfileSettingsModal from "./ProfileSettingsModal";
import { Search, Plus } from "lucide-react";

const Sidebar = ({
  chats = [],
  currentUserId,
  activeChat,
  onChatSelect,
  onNewChat,
  user,
  onLogout,
  activeSection = "chats",
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // Handle direct chat creation with proper debugging
  const handleCreateChat = async (receiverEmail) => {
    console.log("Sidebar handleCreateChat called with:", receiverEmail);
    if (isCreatingChat) return;

    setIsCreatingChat(true);
    try {
      console.log("Sidebar calling onNewChat with:", receiverEmail, false, []);
      await onNewChat(receiverEmail, false, []); // receiverEmail, isGroup=false, memberEmails=[]
    } catch (error) {
      console.error("Sidebar: Failed to create direct chat:", error);
      throw error; // Re-throw to let modal handle
    } finally {
      setIsCreatingChat(false);
    }
  };

  // Handle group creation with proper debugging
  const handleCreateGroup = async (groupName, memberEmails) => {
    console.log(
      "Sidebar handleCreateGroup called with:",
      groupName,
      memberEmails
    );
    if (isCreatingChat) return;

    setIsCreatingChat(true);
    try {
      console.log(
        "Sidebar calling onNewChat with:",
        groupName,
        true,
        memberEmails
      );
      await onNewChat(groupName, true, memberEmails); // groupName, isGroup=true, memberEmails
    } catch (error) {
      console.error("Sidebar: Failed to create group:", error);
      throw error; // Re-throw to let modal handle
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <div className={`h-full flex flex-col bg-gray-800 ${className}`}>
      {/* Header with search */}
      <div
        className={`flex-shrink-0 ${
          isMobile ? "p-3" : "p-4"
        } border-b border-gray-700`}
      >
        {/* Title and count */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Mobile Profile Button - Top Left */}
            {isMobile && user && (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center justify-center"
                >
                  <Avatar
                    src={user?.avatar}
                    alt={user?.name || "User"}
                    size="sm"
                    status="online"
                  />
                </button>

                {/* Profile dropdown menu */}
                {showProfileMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    {/* Menu */}
                    <div className="absolute top-full left-0 mt-2 w-56 bg-[#262626] rounded-xl shadow-2xl py-2 z-50 border border-[#404040]">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-[#404040]">
                        <div className="flex items-center space-x-3">
                          <Avatar
                            src={user?.avatar}
                            alt={user?.name || "User"}
                            size="md"
                            status="online"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {user?.name || user?.username || "User"}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowProfileModal(true);
                            setShowProfileMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#404040] transition-colors flex items-center space-x-3"
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
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span>Profile & Settings</span>
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-[#404040] pt-2">
                        <button
                          onClick={() => {
                            onLogout?.();
                            setShowProfileMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#404040] transition-colors flex items-center space-x-3"
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
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            <h1
              className={`font-semibold text-white ${
                isMobile ? "text-lg" : "text-xl"
              }`}
            >
              {getSectionTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-gray-400 ${isMobile ? "text-xs" : "text-sm"}`}
            >
              {filteredChats.length}{" "}
              {filteredChats.length === 1 ? "conversation" : "conversations"}
            </span>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Search input - mobile optimized */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`
              w-full bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${isMobile ? "px-3 py-2 text-sm pl-9" : "px-4 py-3 pl-10"}
            `}
          />
          <Search
            className={`
            absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400
            ${isMobile ? "w-4 h-4" : "w-5 h-5"}
          `}
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredChats.length > 0 ? (
          <div className={isMobile ? "py-2" : "py-3"}>
            {filteredChats.map((chat) => (
              <ChatCard
                key={chat.email}
                chat={chat}
                isActive={activeChat?.email === chat.email}
                onClick={() => onChatSelect(chat)}
                currentUserId={currentUserId}
                isMobile={isMobile}
              />  
            ))}
          </div>
        ) : (
          <div
            className={`
            flex flex-col items-center justify-center text-center text-gray-400 h-full
            ${isMobile ? "p-6" : "p-8"}
          `}
          >
            <div className={`${isMobile ? "text-4xl mb-3" : "text-6xl mb-4"}`}>
              💬
            </div>
            <h3
              className={`font-medium text-gray-300 mb-2 ${
                isMobile ? "text-sm" : "text-lg"
              }`}
            >
              No conversations found
            </h3>
            <p
              className={`mb-4 ${
                isMobile ? "text-xs" : "text-sm"
              } text-center max-w-xs`}
            >
              {searchQuery
                ? "Try adjusting your search terms"
                : `Start a new ${
                    activeSection === "groups" ? "group" : "conversation"
                  } to see it here`}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowNewChatModal(true)}
                className="flex items-center justify-center w-8 h-8 rounded-full transition-transform"
              > 
                Start New Chat
              </button>
            )}
          </div>
        )}
      </div>

      {/* New Chat Modal - pass mobile state */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onCreateChat={handleCreateChat}
        onCreateGroup={handleCreateGroup}
        currentUser={user}
        activeSection={activeSection}
        isCreating={isCreatingChat}
        isMobile={isMobile}
      />

      {/* Profile Settings Modal for mobile */}
      {showProfileModal && (
        <ProfileSettingsModal
          user={user}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;
