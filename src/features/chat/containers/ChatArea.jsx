// chat/containers/ChatArea.jsx - Dark Theme Redesign
import React, { useState, useEffect } from "react";
import ChatTopBar from "../components/ChatTopBar";
import MessageList from "../components/MessageList";
import TypingArea from "../components/TypingArea";
import EmptyState from "../components/EmptyState";
import { useChat } from "../hooks/useChat";
import { useTyping } from "../hooks/useTyping";

const ChatArea = ({ chat, currentUserId, className = "" }) => {
  const {
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    loadMoreMessages,
    hasMoreMessages,
    loading,
  } = useChat(chat?.id);

  const { typingUsers, startTyping, stopTyping } = useTyping(chat?.id);
  const [isConnected, setIsConnected] = useState(true);

  // Handle sending messages
  const handleSendMessage = async (messageData) => {
    try {
      await sendMessage({
        chatId: chat.id,
        content: messageData.content,
        type: messageData.type,
        attachments: messageData.attachments,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      // TODO: Show error notification
    }
  };

  // Handle editing messages
  const handleEditMessage = async (messageId) => {
    console.log("Edit message:", messageId);
    // TODO: Implement edit modal/inline editing
  };

  // Handle deleting messages
  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  // Handle message reactions
  const handleReactToMessage = async (messageId, emoji) => {
    try {
      await reactToMessage(messageId, emoji);
    } catch (error) {
      console.error("Failed to react to message:", error);
    }
  };

  // Handle typing indicators
  const handleTyping = () => {
    startTyping(currentUserId, "You");
  };

  const handleStopTyping = () => {
    stopTyping(currentUserId);
  };

  // Handle voice/video calls
  const handleStartCall = () => {
    console.log("Starting voice call...");
    // TODO: Implement call functionality
  };

  const handleStartVideoCall = () => {
    console.log("Starting video call...");
    // TODO: Implement video call functionality
  };

  // Handle chat info
  const handleShowInfo = () => {
    console.log("Showing chat info...");
    // TODO: Implement chat info modal/sidebar
  };

  const handleShowMembers = () => {
    console.log("Showing chat members...");
    // TODO: Implement members list modal/sidebar
  };

  // If no chat is selected, show empty state
  if (!chat) {
    return (
      <div className={`flex flex-col h-full bg-[#0F0F0F] ${className}`}>
        <EmptyState
          type="no-chat"
          title="Welcome to Chat"
          description="Select a conversation from the sidebar to start messaging, or create a new chat to begin."
          icon={
            <div className="w-24 h-24 bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] rounded-3xl flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          }
          action={
            <button className="px-6 py-3 bg-[#7C3AED] text-white rounded-xl hover:bg-[#8B5CF6] transition-colors font-semibold">
              Start New Chat
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-[#0F0F0F] ${className}`}>
      {/* Chat Header */}
      <ChatTopBar
        chat={chat}
        onStartCall={handleStartCall}
        onStartVideoCall={handleStartVideoCall}
        onShowInfo={handleShowInfo}
        onShowMembers={handleShowMembers}
      />

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-[#FCD34D]/10 border-b border-[#FCD34D]/20 p-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-[#FCD34D] rounded-full animate-pulse"></div>
            <span className="text-sm text-[#FCD34D]">
              Connection lost. Trying to reconnect...
            </span>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 relative overflow-hidden">
        {messages.length === 0 && !loading ? (
          <EmptyState
            type="no-messages"
            title="No messages yet"
            description={`Start the conversation with ${
              chat.type === "group"
                ? chat.name
                : chat.participants?.[0]?.name || "this contact"
            } by sending your first message.`}
            icon={
              <div className="w-20 h-20 bg-[#262626] rounded-2xl flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 8h10m0 0V18a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0l-5-3-5 3"
                  />
                </svg>
              </div>
            }
            className="text-gray-400"
          />
        ) : (
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            typingUsers={typingUsers}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            onReactToMessage={handleReactToMessage}
            onLoadMore={loadMoreMessages}
            hasMore={hasMoreMessages}
            loading={loading}
          />
        )}
      </div>

      {/* Typing Area */}
      <div className="border-t border-[#262626]">
        <TypingArea
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
          disabled={!isConnected}
          placeholder={`Message ${
            chat.type === "group"
              ? chat.name
              : chat.participants?.[0]?.name || "user"
          }...`}
        />
      </div>
    </div>
  );
};

export default ChatArea;
