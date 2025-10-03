// ========================================
// TypingArea.jsx - Mobile Responsive Version
// ========================================
import React, { useState, useRef, useEffect } from "react";
import { Smile, Send } from "lucide-react";

const TypingArea = ({
  onSendMessage,
  onTyping,
  onStopTyping,
  disabled = false,
  placeholder = "Type a message...",
  className = "",
}) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, isMobile ? 100 : 120) + "px";
    }

    // Handle typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping?.();
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onStopTyping?.();
      }
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    onSendMessage?.({
      content: trimmedMessage,
      type: "text",
    });

    // Reset form
    setMessage("");
    setIsTyping(false);
    onStopTyping?.();

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.slice(0, start) + emoji + message.slice(end);
      setMessage(newMessage);
      setTimeout(() => {
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
        textarea.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const commonEmojis = [
    "😀",
    "😂",
    "❤️",
    "👍",
    "👎",
    "😮",
    "😢",
    "😡",
    "🎉",
    "🔥",
    "💯",
    "🚀",
    "✨",
    "💪",
    "🙌",
    "👏",
    "🤔",
    "😍",
    "🥳",
    "😎",
    "🤩",
    "😊",
    "😋",
    "😌",
    "😉",
    "🙃",
    "🤗",
    "🤭",
    "😴",
    "🤯",
  ];

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showEmojiPicker &&
        !e.target.closest(".emoji-picker") &&
        !e.target.closest(".emoji-button")
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`
      border-t border-gray-700 bg-gray-800 p-3 md:p-4
      ${isMobile ? "pb-6" : ""}
      ${className}
    `}
    >
      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="emoji-picker absolute bottom-full left-0 right-0 mb-2 mx-3 md:mx-4">
          <div className="bg-gray-700 rounded-lg p-3 shadow-lg border border-gray-600 max-h-32 overflow-y-auto">
            <div className="grid grid-cols-8 md:grid-cols-10 gap-2">
              {commonEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  className="text-lg hover:bg-gray-600 rounded p-1 transition-colors"
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2 md:gap-3">
        {/* Emoji button */}
        <button
          type="button"
          className="emoji-button flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile size={isMobile ? 16 : 20} />
        </button>

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              resize-none overflow-hidden
              ${
                isMobile
                  ? "px-3 py-2 text-sm max-h-24"
                  : "px-4 py-3 text-base max-h-32"
              }
            `}
            rows="1"
            style={{ minHeight: isMobile ? "36px" : "44px" }}
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="flex items-center justify-center rounded-full transition-transform w-8 h-8"
        >
          <Send size={isMobile ? 14 : 16} />
        </button>
      </form>
    </div>
  );
};

export default TypingArea;
