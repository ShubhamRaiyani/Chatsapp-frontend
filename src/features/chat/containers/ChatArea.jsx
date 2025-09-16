// chat/containers/ChatArea.jsx - Fixed (removed refresh handler)

import React, { useState, useEffect } from "react";
import ChatTopBar from "../components/ChatTopBar";
import MessageList from "../components/MessageList";
import TypingArea from "../components/TypingArea";
import EmptyState from "../components/EmptyState";
import { useChat } from "../hooks/useChat";
import { useTyping } from "../hooks/useTyping";
import ChatAPI from "../services/ChatAPI";

const ChatArea = ({ chat, currentUserId, onBack, className = "" }) => {
  const {
    messages,
    sendMessage,
    deleteMessage,
    reactToMessage,
    loadMoreMessages,
    hasMoreMessages,
    loading,
    connected,
    refreshChats,
    refreshMessages
  } = useChat(chat?.email);

  const { typingUsers, startTyping, stopTyping } = useTyping(chat?.email);
  const [isConnected, setIsConnected] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    setIsConnected(connected);
  }, [connected]);

  const handleSummarizeChat = async (chatId) => {
    if (!chatId || summaryLoading) return;

    setSummaryLoading(true);
    setSummaryError(null);

    try {
      const summary = await ChatAPI.generateChatSummary(chatId);

      // ✅ REFRESH MESSAGES TO SHOW NEW SUMMARY
      await refreshMessages(chatId, chat?.isGroup);

      // Optional: Also refresh chats list to update lastMessage
      setTimeout(() => refreshChats?.(), 500);

      return summary;
    } catch (error) {
      setSummaryError(error.message);
      throw error;
    } finally {
      setSummaryLoading(false);
    }
  };


  const handleSendMessage = async (messageData) => {
    try {
      if (chat && !chat.isGroup) {
        let receiverEmail = chat.receiverEmail;
        if (!receiverEmail && chat.participantEmails) {
          receiverEmail = chat.participantEmails.find(
            (email) => email !== currentUserId
          );
        }
        if (!receiverEmail) throw new Error("Unable to determine recipient");
        await sendMessage(messageData.content, receiverEmail);
      } else if (chat && chat.isGroup) {
        await sendMessage(messageData.content, null);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!chat) {
    return (
      <div className={`chat-area ${className}`}>
        <EmptyState
          title="Select a Chat"
          description="Choose a conversation to start messaging"
          icon="💬"
        />
      </div>
    );
  }

  return (
    <div className={`chat-area ${className}`}>
      <ChatTopBar chat={chat} onBack={onBack} connected={isConnected} />

      {summaryError && (
        <div className="summary-error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{summaryError}</span>
            <button
              onClick={() => setSummaryError(null)}
              className="error-close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="messages-container">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          typingUsers={typingUsers}
          onEditMessage={(id) => console.log("Edit:", id)}
          onDeleteMessage={deleteMessage}
          onReactToMessage={reactToMessage}
          onLoadMore={loadMoreMessages}
          hasMore={hasMoreMessages}
          loading={loading}
          className="messages-list"
          UsernameofChat={chat.displayName }
        />
      </div>

      <TypingArea
        onSendMessage={handleSendMessage}
        onTyping={() => startTyping(currentUserId, "You")}
        onStopTyping={() => stopTyping(currentUserId)}
        disabled={!isConnected}
        placeholder={
          isConnected
            ? `Message ${
                chat.isGroup ? chat.name : chat.receiverEmail || "user"
              }...`
            : "Connecting..."
        }
        chatId={chat.id}
        onSummarizeChat={handleSummarizeChat}
        className="typing-area"
      />
    </div>
  );
};

export default ChatArea;
