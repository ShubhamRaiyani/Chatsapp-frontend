import React, { useEffect, useState, useMemo } from "react";
import MessageBubble from "./ui/MessageBubble";
import TypingIndicator from "./ui/TypingIndicator";
import { groupMessagesByDate, shouldShowAvatar } from "../utils/messageUtils";
import { ChevronDown } from "lucide-react";
import { useChatScroll } from "../hooks/useChatScroll";

const MessageList = ({
  messages = [],
  currentUserId,
  typingUsers = [],
  onEditMessage,
  onDeleteMessage,
  onReactToMessage,
  onLoadMore,
  hasMore,
  loading,
  className = "",
  UsernameofChat,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Use custom hook for scroll management
  const {
    containerRef,
    messagesEndRef,
    showScrollButton,
    readyToShow,
    scrollToBottom,
    handleScroll
  } = useChatScroll({
    messages,
    hasMore,
    loading,
    onLoadMore
  });

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Attach scroll listener via hook
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll, containerRef]);

  // Memoize grouped messages to avoid expensive recalculation on every render
  const groupedMessages = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages]);

  const renderDateSeparator = (date) => (
    <div key={`date-${date}`} className="flex justify-center my-4">
      <div className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
        {date}
      </div>
    </div>
  );

  return (
    <div className={`flex-1 flex flex-col min-h-0 relative ${className}`}>
      {/* Loading indicator for pagination */}
      {loading && hasMore && (
        <div className="flex justify-center py-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Messages container */}
      <div
        ref={containerRef}
        className={`
          flex-1 overflow-y-auto custom-scrollbar
          ${isMobile ? "px-2 py-2" : "px-4 py-4"}
        `}
        // Hide content until initial scroll-to-bottom is done (managed by hook)
        style={{
          visibility:
            readyToShow || messages.length === 0 ? "visible" : "hidden",
        }}
      >
        {/* 🔹 Load older messages button (top of list) */}
        {hasMore && (
          <div className="flex justify-center my-2">
            <button
              onClick={() => onLoadMore && onLoadMore()}
              disabled={loading}
              className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-200 disabled:opacity-60"
            >
              {loading ? "Loading older messages..." : "Load older messages"}
            </button>
          </div>  
        )}
        
        {groupedMessages.map(({ date, messages: dayMessages }) => (
          <div key={date}>
            {renderDateSeparator(date)}
            {dayMessages.map((message, index) => {
              const isOwn = message.senderEmail === currentUserId;
              const showAvatar = shouldShowAvatar(
                dayMessages,
                index,
                currentUserId
              );

              return (
                <MessageBubble
                  key={message.messageId || message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar && !isOwn}
                  isGrouped={!showAvatar}
                  currentUserId={currentUserId}
                  UsernameofChat={UsernameofChat}
                  isMobile={isMobile}
                  onEdit={onEditMessage}
                  onDelete={onDeleteMessage}
                  onReact={onReactToMessage}
                />
              );
            })}
          </div>
        ))}

        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className={`${isMobile ? "px-2 py-1" : "px-4 py-2"}`}>
            <TypingIndicator users={typingUsers} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button - mobile optimized */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute right-4 bottom-20 bg-gray-800 p-2 rounded-full shadow-lg border border-gray-700 text-white hover:bg-gray-700 transition-all z-10"
          aria-label="Scroll to bottom"
        >
          <ChevronDown size={isMobile ? 20 : 24} />
        </button>
      )}
    </div>
  );
};

export default MessageList;
