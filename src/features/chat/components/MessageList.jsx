import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
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
  hasMore,
  loading,
  className = "",
  UsernameofChat,
}) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const [hasInitialScroll, setHasInitialScroll] = useState(false);
  const [readyToShow, setReadyToShow] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const lastScrollTop = useRef(0);

  // For anchoring when loading older messages
  const scrollAdjustRef = useRef({
    pending: false,
    prevScrollBottomOffset: 0,
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

  const scrollToBottom = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.scrollTop = container.scrollHeight;
  };

  const handleScroll = React.useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // Detect scroll direction
    const isScrollingUp = scrollTop < lastScrollTop.current;
    lastScrollTop.current = scrollTop;

    const atBottom = scrollHeight - scrollTop <= clientHeight + 2;
    setShowScrollButton(!atBottom && messages.length > 10);

    // Load more only when user scrolls UP near the top
    if (isScrollingUp && scrollTop <= 50 && hasMore && !loading && onLoadMore) {
      console.log("🔼 User scrolled up near top, calling onLoadMore()");

      // Save *distance from bottom* BEFORE loading older messages
      const prevScrollBottomOffset = scrollHeight - scrollTop;

      scrollAdjustRef.current = {
        pending: true,
        prevScrollBottomOffset,
      };

      onLoadMore();
    }
  }, [hasMore, loading, messages.length, onLoadMore]);
  const handleManualLoadMore = () => {
    if (!hasMore || loading || !onLoadMore || !containerRef.current) return;

    const container = containerRef.current;
    const { scrollTop, scrollHeight } = container;

    // Save distance from bottom BEFORE loading older messages
    const prevScrollBottomOffset = scrollHeight - scrollTop;

    scrollAdjustRef.current = {
      pending: true,
      prevScrollBottomOffset,
    };

    console.log("⬆️ Manual load older messages");
    onLoadMore();
  };


  // 1) INITIAL SCROLL – do it BEFORE paint and hide content until done
  useLayoutEffect(() => {
    if (!hasInitialScroll && messages.length > 0 && containerRef.current) {
      // Scroll to bottom BEFORE user sees anything
      scrollToBottom();
      setHasInitialScroll(true);
      setReadyToShow(true);
    }
  }, [messages.length, hasInitialScroll]);

  // 2) AFTER MESSAGES CHANGE – handle anchor when older messages are prepended
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (scrollAdjustRef.current.pending) {
      const { prevScrollBottomOffset } = scrollAdjustRef.current;
      const newScrollHeight = container.scrollHeight;

      // Keep the same distance from bottom → stay at the join of batches
      const newScrollTop = newScrollHeight - prevScrollBottomOffset;
      container.scrollTop = newScrollTop;

      scrollAdjustRef.current.pending = false;
      return;
    }

    // ❌ No auto-scroll-to-bottom here on normal updates
    // User controls position unless it's the very first load
  }, [messages]);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

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
        // Hide content until initial scroll-to-bottom is done
        style={{
          visibility:
            readyToShow || messages.length === 0 ? "visible" : "hidden",
        }}
      >
        {/* 🔹 Load older messages button (top of list) */}
        {hasMore && (
          <div className="flex justify-center my-2">
            <button
              onClick={handleManualLoadMore}
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
          onClick={() => {
            scrollToBottom();
          }}
          className="absolute rounded-full transition-transform hover:scale-110"
        >
          <ChevronDown size={isMobile ? 20 : 24} />
        </button>
      )}
    </div>
  );
};

export default MessageList;
