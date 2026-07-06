// chat/containers/Dashboard.jsx - MOBILE RESPONSIVE VERSION
import React, { useState, useEffect } from "react";
import NavigationSidebar from "../components/NavigationSidebar";
import ChatList from "./ChatList";
import ChatArea from "./ChatArea";
import EmptyState from "../components/EmptyState";
import FullscreenPrompt from "../components/FullscreenPrompt";
import { useAuth } from "../../auth/hooks/useAuth";
import { useChat } from "../hooks/useChat";

const Dashboard = ({ className = "" }) => {
  const { user, logout } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [activeSection, setActiveSection] = useState("chats");
  const [isMobile, setIsMobile] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // Track the visual viewport height so the mobile container shrinks correctly
  // when the software keyboard opens, keeping the top bar always visible.
  const [vpHeight, setVpHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight
  );
  useEffect(() => {
    const update = () =>
      setVpHeight(window.visualViewport?.height ?? window.innerHeight);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    return () => {
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, []);

  // Get chat context for creating chats
  const { createPersonalChat, createGroupChat, selectChat, chats, refreshChats ,loadChats} = useChat();

  // Keep activeChat in sync with the chats array.
  // - If the chat was updated (e.g. new members added) → apply fresh data.
  // - If the chat is gone (e.g. user left a group) → navigate back immediately
  //   without waiting for the slow loadChats() call to finish.
  useEffect(() => {
    if (!activeChat) return;
    const updated = chats.find((c) => c.id === activeChat.id);
    if (updated && updated !== activeChat) {
      setActiveChat(updated);
    } else if (!updated) {
      setActiveChat(null);
    }
  }, [chats]);

  // Calculate chat counts from actual data
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

    return { total, direct, groups, archived, starred };
  };

  const chatCounts = getChatCounts();

  // Enhanced responsive design handling
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (mobile) {
        // On mobile, show chat list by default, hide when chat is selected
        if (activeChat) {
          setShowChatList(false);
        } else {
          setShowChatList(true);
        }
      } else {
        // On desktop/tablet, always show chat list
        setShowChatList(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [activeChat]);

  // Handle chat selection
  const handleChatSelect = async (chat) => {
    setActiveChat(chat);
    await selectChat(chat);
    if (isMobile) {
      setShowChatList(false);
    }
  };

  // Handle back to chat list (mobile)
  const handleBackToChatList = () => {
    setShowChatList(true);
    if (isMobile) {
      setActiveChat(null);
    }
  };

  // Handle section navigation with filtering and proper syncing
  const handleSectionChange = (section) => {
    console.log("Dashboard: Section changed to:", section);
    setActiveSection(section);
    setActiveChat(null);

    // Ensure chat list is visible on mobile when changing sections
    if (isMobile) {
      setShowChatList(true);
    }
  };

  // Handle new chat creation with proper parameter validation
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

    // Validation: Check if emailOrName is defined
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

        // Validation: Check memberEmails array
        if (!Array.isArray(memberEmails) || memberEmails.length === 0) {
          throw new Error("Group must have at least one member");
        }
        newChat = await createGroupChat(emailOrName, memberEmails);
      } else {
        // Create direct chat: emailOrName is the receiver's email
        console.log("Dashboard: Creating direct chat with email:", emailOrName);

        // Validation: Check email format
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

  return isMobile ? (
    <>
      {activeChat ? (
        <div
          className="w-full flex flex-col bg-[#0e0e1a] overflow-hidden fixed top-0 left-0 right-0"
          style={{ height: vpHeight }}
        >
          <ChatArea
            chat={activeChat}
            currentUserId={user?.email}
            onBack={handleBackToChatList}
          />
        </div>
      ) : (
        <div
          className="w-full bg-[#0e0e1a] overflow-hidden fixed top-0 left-0 right-0"
          style={{ height: vpHeight }}
        >
          <ChatList
            chats={chats}
            currentUserId={user?.email}
            activeChat={activeChat}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
            user={user}
            onLogout={handleLogout}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
        </div>
      )}
      <FullscreenPrompt />
    </>
  ) : (
    // Desktop/tablet view: original layout
    <div
      className={`h-screen w-full flex overflow-hidden bg-[#0e0e1a] ${className}`}
    >
      {/* Navigation Sidebar */}
      <div className="flex-shrink-0 md:w-16 w-12">
        <NavigationSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          user={user}
          onLogout={handleLogout}
          chatCounts={chatCounts}
        />
      </div>

      {/* Chat List Sidebar */}
      <div className="flex-shrink-0 w-80 bg-[#13131f] border-r border-white/[0.06]">
        <ChatList
          chats={chats}
          currentUserId={user?.email}
          activeChat={activeChat}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          user={user}
            activeSection={activeSection}
            loadChats={loadChats}
        />
      </div>

      {/* Main Chat Area or EmptyState */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <ChatArea
            chat={activeChat}
            currentUserId={user?.email}
            onBack={handleBackToChatList}
          />
        ) : (
          <EmptyState
            activeSection={activeSection}
            onNewChat={() => setShowNewChatModal(true)}
          />
        )}
      </div>
    </div>
  );

};

export default Dashboard;
