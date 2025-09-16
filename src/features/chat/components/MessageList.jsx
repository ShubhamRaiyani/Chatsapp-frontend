import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./ui/MessageBubble";
import TypingIndicator from "./ui/TypingIndicator";
import ReadReceipt from "./ui/ReadReceipt";
import { groupMessagesByDate, shouldShowAvatar } from "../utils/messageUtils";

const MessageList = ({
  messages = [],
  currentUserId,
  typingUsers = [],
  onEditMessage,
  onDeleteMessage,
  onReactToMessage,
  onLoadMore,
  hasMore = false,
  loading = false,
  className = "",
  UsernameofChat,
}) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const atBottom = scrollHeight - scrollTop <= clientHeight + 100;
    setIsAtBottom(atBottom);
    setShowScrollButton(!atBottom && messages.length > 10);

    if (scrollTop === 0 && hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  };

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom(false);
    }
  }, [messages, isAtBottom]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [hasMore, loading, messages.length]);

  const groupedMessages = groupMessagesByDate(messages);

  const renderDateSeparator = (date) => (
    <div className="flex justify-center my-4" key={`date-${date}`}>
      <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {date}
        </span>
      </div>
    </div>
  );

  const renderMessage = (message, index, messagesInGroup) => {
    // ✅ FIXED: Proper isOwn calculation
    const isOwn = message.senderEmail === currentUserId || message.senderId === currentUserId;
    console.log("🧾 Message senderEmail:", message.senderEmail, "Current userId:", currentUserId, "isOwn:", isOwn);
    // Calculate if avatar should be shown
    const showAvatar = shouldShowAvatar(message, index, messagesInGroup, isOwn);
    
    // Check if message is grouped (consecutive messages from same sender)
    const isGrouped = index > 0 && 
      messagesInGroup[index - 1].senderEmail === message.senderEmail;

    console.log("📨 Rendering message:", {
      messageId: message.messageId || message.id,
      senderEmail: message.senderEmail,
      currentUserId,
      isOwn,
      showAvatar
    });

    return (
      <div
        key={message.messageId || message.id || `msg-${index}`}
        className={`w-full flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}
      >
        <div className={`max-w-[80%] md:max-w-[60%] ${isOwn ? 'order-2' : 'order-1'}`}>
          <MessageBubble
            message={message}
            isOwn={isOwn}
            showAvatar={showAvatar}
            isGrouped={isGrouped}
            currentUserId={currentUserId}
            onEdit={onEditMessage}
            onDelete={onDeleteMessage}
            onReact={onReactToMessage}
            UsernameofChat={UsernameofChat}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-1"
      >
        {loading && hasMore && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Render grouped messages by date */}
        {groupedMessages.map(({ date, messages: messagesInGroup }) => (
          <div key={date}>
            {renderDateSeparator(date)}
            {messagesInGroup.map((message, index) =>
              renderMessage(message, index, messagesInGroup)
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start mb-1">
            <div className="max-w-[80%] md:max-w-[60%]">
              <TypingIndicator users={typingUsers} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-20 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MessageList;
