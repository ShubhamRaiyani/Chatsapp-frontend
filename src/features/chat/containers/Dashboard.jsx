// chat/containers/Dashboard.jsx - FIXED: Parameter handling and debugging
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
  const [isMobile, setIsMobile] = useState(false);
  const [showChatList, setShowChatList] = useState(true);

  // ✅ Get chat context for creating chats
  const { createPersonalChat, createGroupChat, selectChat, chats } = useChat();

  // ✅ Calculate chat counts from actual data
  const getChatCounts = () => {
    const total = chats.filter((chat) => !chat.archived).length;
    const direct = chats.filter(
      (chat) => !chat.isGroup && !chat.archived
    ).length;
    const groups = chats.filter(
      (chat) => chat.isGroup && !chat.archived
    ).length;
    const archived = chats.filter((chat) => chat.archived).length;
    const starred = chats.filter((chat) => chat.starred).length;

    return {
      total,
      direct,
      groups,
      archived,
      starred,
    };
  };

  const chatCounts = getChatCounts();

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
  const handleChatSelect = async (chat) => {
    console.log("Dashboard: Selecting chat:", chat);
    setActiveChat(chat);

    // Select chat in context to load messages
    await selectChat(chat);

    if (isMobile) {
      setShowChatList(false);
    }
  };

  // Handle back to chat list (mobile)
  const handleBackToChatList = () => {
    setShowChatList(true);
    setActiveChat(null);
  };

  // ✅ Handle section navigation with filtering and proper syncing
  const handleSectionChange = (section) => {
    console.log("Dashboard: Section changed to:", section);
    setActiveSection(section);
    setActiveChat(null); // Clear selected chat when switching sections

    // Ensure chat list is visible on mobile when changing sections
    if (isMobile) {
      setShowChatList(true);
    }
  };

  // ✅ FIXED: Handle new chat creation with proper parameter validation and debugging
  const handleNewChat = async (
    emailOrName,
    isGroup = false,
    memberEmails = []
  ) => {
    console.log("Dashboard handleNewChat called with:", {
      emailOrName,
      isGroup,
      memberEmails,
      type: typeof emailOrName,
    });

    // ✅ VALIDATION: Check if emailOrName is defined
    if (!emailOrName || emailOrName === undefined) {
      console.error("Dashboard: emailOrName is undefined!");
      throw new Error("Email or group name is required");
    }

    try {
      let newChat;

      if (isGroup) {
        // Create group chat: emailOrName is the group name
        console.log(
          "Dashboard: Creating group chat:",
          emailOrName,
          "with members:",
          memberEmails
        );

        // ✅ VALIDATION: Check memberEmails array
        if (!Array.isArray(memberEmails) || memberEmails.length === 0) {
          throw new Error("Group must have at least one member");
        }

        newChat = await createGroupChat(emailOrName, memberEmails);
      } else {
        // Create direct chat: emailOrName is the receiver's email
        console.log("Dashboard: Creating direct chat with email:", emailOrName);

        // ✅ VALIDATION: Check email format
        if (typeof emailOrName !== "string" || !emailOrName.includes("@")) {
          console.error("Dashboard: Invalid email format:", emailOrName);
          throw new Error("Invalid email address");
        }

        newChat = await createPersonalChat(emailOrName);
      }

      if (newChat) {
        console.log("Dashboard: Chat created successfully:", newChat);
        // Chat will be automatically selected by the provider
        setActiveChat(newChat);

        if (isMobile) {
          setShowChatList(false);
        }
      }

      return newChat;
    } catch (error) {
      console.error("Dashboard: Failed to create chat:", error);
      throw error; // Re-throw to be handled by the modal
    }
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
    <div className={`h-screen bg-gray-900 flex overflow-hidden ${className}`}>
      {/* Navigation Sidebar - Always visible on desktop */}
      <NavigationSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        user={user}
        onLogout={handleLogout}
        chatCounts={chatCounts}
      />

      {/* Chat List - Conditional on mobile */}
      <div
        className={`${
          isMobile ? (showChatList ? "flex" : "hidden") : "flex"
        } w-full md:w-80 flex-shrink-0`}
      >
        <ChatList
          currentUserId={user?.id}
          activeChat={activeChat}
          activeSection={activeSection}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat} // ✅ Pass the fixed handler with proper validation
          onLogout={handleLogout}
          user={user}
          className="w-full"
        />
      </div>

      {/* Chat Area - Main content */}
      <div
        className={`${
          isMobile ? (showChatList ? "hidden" : "flex") : "flex"
        } flex-1 flex flex-col min-w-0`}
      >
        {activeChat ? (
          <ChatArea
            chat={activeChat}
            currentUserId={user?.email}
            onBack={handleBackToChatList}
            className="flex-1"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-800">
            <div className="text-center p-8">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
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
              <h2 className="text-2xl font-semibold text-white mb-2">
                Welcome to Chat
              </h2>
              <p className="text-gray-400 mb-6">
                Select a conversation from the{" "}
                {activeSection === "groups" ? "groups" : "chat list"} to start
                messaging
              </p>

              {/* Quick action based on active section */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    // This will trigger the new chat modal
                    // The actual creation happens in the Sidebar component
                  }}
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  {activeSection === "groups"
                    ? "Create New Group"
                    : "Start New Chat"}
                </button>

                {/* Mobile back button */}
                {isMobile && (
                  <button
                    onClick={handleBackToChatList}
                    className="inline-flex items-center px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to {activeSection === "groups" ? "Groups" : "Chats"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
