import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./ui/MessageBubble";
import TypingIndicator from "./ui/TypingIndicator";
import ReadReceipt from "./ui/ReadReceipt";
import { groupMessagesByDate, shouldShowAvatar } from "../utils/messageUtils";
import { ChevronDown } from "lucide-react";

const MessageList = ({
  messages = [],
  currentUserId,
  typingUsers = [],
  onEditMessage,
  onDeleteMessage,
  onReactToMessage,
  onLoadMore,
  hasMore ,
  loading ,
  className = "",
  UsernameofChat,
}) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const handleScroll = React.useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    console.log("scrollTop:", scrollTop);

    const atBottom = scrollHeight - scrollTop <= clientHeight + 100;
    setIsAtBottom(atBottom);
    setShowScrollButton(!atBottom && messages.length > 10);

    if (scrollTop <= 50 && hasMore && !loading && onLoadMore) {
      console.log("🔼 Reached top, calling onLoadMore()");
      onLoadMore();
    }
  }, [hasMore, loading, messages.length, onLoadMore]);



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
  }, [hasMore, loading, messages.length, handleScroll]);

  const groupedMessages = groupMessagesByDate(messages);

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
        style={{
          scrollBehavior: "smooth",
        }}
      >
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
                  key={message.id}
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
          onClick={() => scrollToBottom()}
          className="absolute rounded-full transition-transform hover:scale-110"
        >
          <ChevronDown size={isMobile ? 20 : 24} />
        </button>
      )}
    </div>
  );
};

export default MessageList;
