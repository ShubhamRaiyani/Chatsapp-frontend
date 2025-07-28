// chat/containers/Dashboard.jsx
import React, { useState, useEffect } from "react";
import NavigationSidebar from "../components/NavigationSidebar";
import ChatList from "./ChatList";
import ChatArea from "./ChatArea";
import { useAuth } from "../../auth/hooks/useAuth";


const Dashboard = ({ className = "" }) => {
  const { user, logout } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [activeSection, setActiveSection] = useState("chats");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showChatList, setShowChatList] = useState(true);

  // Handle responsive design
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768 && activeChat) {
        setShowChatList(false);
      } else {
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

  // Handle section navigation
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setActiveChat(null);
  };

  // Handle new chat
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
    <div className={`flex h-screen bg-[#0F0F0F] text-white ${className}`}>
      {/* Navigation Sidebar */}
      <NavigationSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        user={user}
        onLogout={handleLogout}
      />

      {/* Chat List */}
      <div
        className={`${
          isMobile ? (showChatList ? "w-full" : "hidden") : "w-80 flex-shrink-0"
        } transition-all duration-300`}
      >
          <ChatList
            currentUserId={user?.id}
            activeChat={activeChat}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
            user={user}
            activeSection={activeSection}
          />
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 ${
          isMobile && showChatList ? "hidden" : "flex flex-col"
        }`}
      >
        {/* Mobile header for chat area */}
        {isMobile && activeChat && (
          <div className="flex items-center p-4 bg-[#1A1A1A] border-b border-[#262626] md:hidden">
            <button
              onClick={handleBackToChatList}
              className="p-2 text-gray-400 hover:text-white mr-3 hover:bg-[#262626] rounded-lg transition-colors"
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
            </button>
            <span className="font-medium text-white">Back to Chats</span>
          </div>
        )}

              <ChatArea
                chat={activeChat}
                currentUserId={user?.id}
                className="flex-1"
              />
      
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-md mx-4 border border-[#262626]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Start New Chat
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-gray-400 hover:text-white hover:bg-[#262626] p-2 rounded-lg transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  console.log("Start direct chat");
                  setShowNewChatModal(false);
                }}
                className="w-full text-left p-4 rounded-xl hover:bg-[#262626] transition-colors flex items-center space-x-4 group"
              >
                <div className="bg-[#7C3AED] text-white p-3 rounded-xl group-hover:bg-[#8B5CF6] transition-colors">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white">Direct Message</p>
                  <p className="text-sm text-gray-400">
                    Start a private conversation
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  console.log("Create group chat");
                  setShowNewChatModal(false);
                }}
                className="w-full text-left p-4 rounded-xl hover:bg-[#262626] transition-colors flex items-center space-x-4 group"
              >
                <div className="bg-[#10B981] text-white p-3 rounded-xl group-hover:bg-[#059669] transition-colors">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white">Group Chat</p>
                  <p className="text-sm text-gray-400">
                    Create a group with multiple people
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
