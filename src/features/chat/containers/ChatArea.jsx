// chat/containers/ChatArea.jsx
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
  } = useChat(chat?.id);

  const { typingUsers, startTyping, stopTyping } = useTyping(chat?.id);
  const [isConnected, setIsConnected] = useState(true);

  // Update connection status
  useEffect(() => {
    setIsConnected(connected);
  }, [connected]);

  // Handle sending messages
  const handleSendMessage = async (messageData) => {
    try {
      // Get receiver email from chat participants
      let receiverEmail = null;
      if (chat && !chat.isGroup) {
        receiverEmail = chat.participants?.find(
          (p) => p.id !== currentUserId
        )?.email;
      }

      await sendMessage(messageData.content, receiverEmail);
    } catch (error) {
      console.error("Failed to send message:", error);
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
      <div
        className={`h-full w-full flex items-center justify-center bg-gray-900 ${className}`}
      >
        <EmptyState
          title="Select a chat to start messaging"
          description="Choose a conversation from the sidebar to begin."
        />
      </div>
    );
  }

  return (
    <div
      className={`h-full w-full flex flex-col overflow-hidden bg-gray-900 ${className}`}
    >
      {/* Chat Header - Fixed height */}
      <div className="shrink-0 h-16 border-b border-gray-700 bg-gray-800">
        <ChatTopBar
          chat={chat}
          isConnected={isConnected}
          onStartCall={() => console.log("Starting call...")}
          onStartVideoCall={() => console.log("Starting video call...")}
          onShowInfo={() => console.log("Show info...")}
          onShowMembers={() => console.log("Show members...")}
          onBack={onBack}
        />
      </div>

      {/* Messages Area - Flexible, scrollable */}
      <div className="flex-1 overflow-hidden min-h-0 bg-gray-900">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          onReactToMessage={handleReactToMessage}
          onLoadMore={loadMoreMessages}
          hasMore={hasMoreMessages}
          loading={loading}
          typingUsers={typingUsers}
        />
      </div>

      {/* Typing Area - Fixed height */}
      <div className="shrink-0 p-4 border-t border-gray-700 bg-gray-800">
        <TypingArea
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
          disabled={!isConnected}
          placeholder={!isConnected ? "Reconnecting..." : "Type a message..."}
        />
      </div>
    </div>
  );
};

export default ChatArea;
