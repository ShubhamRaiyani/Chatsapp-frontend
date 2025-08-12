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
    <div className="flex items-center justify-center my-4">
      <div className="flex-grow border-t border-gray-300"></div>
      <span className="px-4 text-sm text-gray-500 bg-white">{date}</span>
      <div className="flex-grow border-t border-gray-300"></div>
    </div>
  );

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
      >
        {/* Loading spinner when fetching more messages */}
        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Render messages grouped by date */}
        {groupedMessages.map(({ date, messages: dayMessages }) => (
          <div key={date}>
            {renderDateSeparator(date)}
            {dayMessages.map((message, index) => {
              const isOwn = message.senderId === currentUserId;
              const prevMessage = dayMessages[index - 1];
              const nextMessage = dayMessages[index + 1];
              const showAvatar = shouldShowAvatar(
                message,
                prevMessage,
                nextMessage,
                isOwn
              );
              const isGrouped =
                !showAvatar &&
                prevMessage &&
                prevMessage.senderId === message.senderId;

              return (
                <MessageBubble
                  key={message.id} // ✅ Correct key placement
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  isGrouped={isGrouped}
                  onEdit={onEditMessage}
                  onDelete={onDeleteMessage}
                  onReact={onReactToMessage}
                />
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

        {/* Read receipt for last message */}
        {messages.length > 0 && (
          <ReadReceipt
            message={messages[messages.length - 1]}
            users={[]} // Replace with actual users if available
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-20 right-8 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-10"
          title="Scroll to bottom"
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
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MessageList;
