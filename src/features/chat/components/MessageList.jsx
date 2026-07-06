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
    <div key={`date-${date}`} className="flex items-center gap-3 my-5 px-4">
      <div className="flex-1 h-px bg-white/[0.06]" />
      <span className="text-[11px] text-gray-500 bg-[#13131f] px-2">{date}</span>
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  );

  return (
    <div className={`flex-1 flex flex-col min-h-0 relative ${className}`}>
      {/* Loading indicator for pagination */}
      {loading && hasMore && (
        <div className="flex justify-center py-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Messages container */}
      <div
        ref={containerRef}
        className={`
          flex-1 overflow-y-auto custom-scrollbar py-4
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

        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator — outside scroll so it's always visible above the input */}
      {typingUsers.length > 0 && (
        <div className="flex-shrink-0 px-4 py-1 border-t border-white/[0.04]">
          <TypingIndicator users={typingUsers} />
        </div>
      )}

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
