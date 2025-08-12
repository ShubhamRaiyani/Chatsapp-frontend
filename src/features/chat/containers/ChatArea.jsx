// chat/containers/ChatArea.jsx - Optimized to use chat object directly

import React, { useState, useEffect } from "react";
import ChatTopBar from "../components/ChatTopBar";
import MessageList from "../components/MessageList";
import TypingArea from "../components/TypingArea";
import EmptyState from "../components/EmptyState";
import { useChat } from "../hooks/useChat";
import { useTyping } from "../hooks/useTyping";

const ChatArea = ({ chat, currentUserId, onBack, className = "" }) => {
  const {
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    loadMoreMessages,
    hasMoreMessages,
    loading,
    connected,
    // ✅ REMOVED: chatDetails - no longer needed since chat object has all details
  } = useChat(chat?.id);

  const { typingUsers, startTyping, stopTyping } = useTyping(chat?.id);
  const [isConnected, setIsConnected] = useState(true);

  // Update connection status
  useEffect(() => {
    setIsConnected(connected);
  }, [connected]);

  // ✅ SIMPLIFIED: Handle sending messages using receiverEmail directly from chat
  const handleSendMessage = async (messageData) => {
    try {
      console.log("🔍 ChatArea - Chat object:", chat);

      let receiverEmail = null;

      if (chat && !chat.isGroup) {
        // ✅ Use receiverEmail directly from chat object (now included in ChatDTO)
        receiverEmail = chat.receiverEmail;

        console.log("📧 Using receiverEmail from chat object:", receiverEmail);

        // ✅ FALLBACK: Extract from participants if receiverEmail is not set
        if (!receiverEmail && chat.participantEmails) {
          // Find the other participant's email (not current user)
          const currentUserEmail = currentUserId; // Assuming currentUserId is the email
          receiverEmail = chat.participantEmails.find(
            (email) => email !== currentUserEmail
          );
          console.log(
            "📧 Fallback: Using receiverEmail from participants:",
            receiverEmail
          );
        }

        if (!receiverEmail) {
          console.error("❌ No receiverEmail found for direct message");
          throw new Error("Unable to determine message recipient");
        }
      }

      // ✅ Send message with the determined receiverEmail
      console.log("📤 Sending message with receiverEmail:", receiverEmail);
      await sendMessage(messageData.content, receiverEmail);
      console.log("✅ Message sent successfully");
    } catch (error) {
      console.error("Failed to send message:", error);
      // You could show a toast notification here
    }
  };

  // Handle editing messages
  const handleEditMessage = async (messageId) => {
    console.log("Edit message:", messageId);
    // TODO: Implement edit functionality
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

  // If no chat is selected, show empty state
  if (!chat) {
    return (
      <div className={`flex-1 flex items-center justify-center ${className}`}>
        <EmptyState
          type="no-chat"
          title="No Chat Selected"
          description="Select a conversation from the sidebar to start messaging"
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gray-800 ${className}`}>
      {/* Chat Header */}
      <ChatTopBar
        chat={chat} // ✅ Chat object already has all details (displayName, etc.)
        onBack={onBack}
        className="flex-shrink-0"
      />

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-600 text-white px-4 py-2 text-sm text-center">
          ⚠️ Disconnected - Attempting to reconnect...
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
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
          className="flex-1"
        />
      </div>

      {/* Typing Area */}
      <TypingArea
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
        disabled={!isConnected}
        placeholder={
          !isConnected
            ? "Connecting..."
            : `Message ${chat.displayName || "User"}...`
        }
        className="flex-shrink-0"
      />
    </div>
  );
};

export default ChatArea;
