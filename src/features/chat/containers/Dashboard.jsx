// chat/containers/Dashboard.jsx
import React, { useState, useEffect } from "react";
import NavigationSidebar from "../components/NavigationSidebar";
import ChatList from "./ChatList";
import ChatArea from "./ChatArea";
import { useAuth } from "../../auth/hooks/useAuth";
import { useChat } from "../hooks/useChat";

const Dashboard = ({ className = "" }) => {
  const { user, logout } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [activeSection, setActiveSection] = useState("chats");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showChatList, setShowChatList] = useState(true);

  // ✅ Get chat counts for navigation
  const { chatCounts } = useChat();

  // Handle responsive design
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (mobile && activeChat) {
        setShowChatList(false);
      } else if (!mobile) {
        setShowChatList(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [activeChat]);

  // Handle chat selection
  const handleChatSelect = (chat) => {
    setActiveChat(chat);
    if (isMobile) {
      setShowChatList(false);
    }
  };

  // Handle back to chat list (mobile)
  const handleBackToChatList = () => {
    setShowChatList(true);
    setActiveChat(null);
  };

  // ✅ Handle section navigation with filtering
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setActiveChat(null); // Clear selected chat when switching sections
  };

  // Handle new chat based on section
  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div
      className={`h-screen w-screen overflow-hidden flex bg-gray-900 text-white ${className}`}
    >
      {/* Navigation Sidebar - Always visible on desktop, bottom on mobile */}
      <div className="hidden md:flex shrink-0 w-16 h-full bg-gray-800 border-r border-gray-700 z-50">
        <NavigationSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          user={user}
          onLogout={handleLogout}
          chatCounts={chatCounts} // ✅ Pass chat counts
        />
      </div>

      {/* Mobile Navigation - Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-gray-800 border-t border-gray-700 z-50">
        <NavigationSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          user={user}
          onLogout={handleLogout}
          chatCounts={chatCounts} // ✅ Pass chat counts
          mobile={true}
        />
      </div>

      {/* Chat List - Conditional visibility on mobile */}
      <div
        className={`
        shrink-0 w-80 h-full bg-gray-800 border-r border-gray-700 overflow-hidden transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobile ? "absolute top-0 left-0 z-40" : ""}
        ${showChatList ? "translate-x-0" : "-translate-x-full"}
        ${isMobile ? "w-full pb-14" : ""}
      `}
      >
        <ChatList
          currentUserId={user?.id}
          activeChat={activeChat}
          activeSection={activeSection} // ✅ Pass active section
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onLogout={handleLogout}
          user={user}
        />
      </div>

      {/* Chat Area - Main content */}
      <div
        className={`
        flex-1 h-full overflow-hidden flex flex-col min-w-0
        ${isMobile ? "pb-14" : ""}
      `}
      >
        {/* Mobile Back Button */}
        {isMobile && activeChat && (
          <button
            className="md:hidden shrink-0 h-12 px-4 bg-gray-700 hover:bg-gray-600 text-white border-b border-gray-600 flex items-center space-x-2 transition-colors"
            onClick={handleBackToChatList}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back to {activeSection}</span>
          </button>
        )}

        <ChatArea
          chat={activeChat}
          currentUserId={user?.id}
          onBack={isMobile ? handleBackToChatList : null}
        />
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                New {activeSection === "groups" ? "Group" : "Chat"}
              </h2>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {/* Modal content changes based on section */}
            <div className="text-gray-300">
              {activeSection === "groups" ? (
                <p>Create a new group chat...</p>
              ) : (
                <p>Start a new direct message...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
