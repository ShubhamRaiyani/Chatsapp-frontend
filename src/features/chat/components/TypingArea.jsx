// ========================================
// TypingArea.jsx - Simplified with Tailwind
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

  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
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
      className={`relative p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-end gap-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-3xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all duration-200">
          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 bg-transparent border-none outline-none resize-none 
             text-gray-900 dark:text-gray-100 
             placeholder-gray-500 dark:placeholder-gray-400
             text-base leading-6 
             min-h-[35px] max-h-[100px] 
             px-2 py-3"
            rows="1"
          /> 

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabled}
              className={`emoji-button flex items-center justify-center w-12 h-12 rounded-full border-none transition-all duration-200 ${
                showEmojiPicker
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                  : "bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-300"
              } ${
                disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:scale-105"
              }`}
              title="Add Emoji"
            >
              <Smile size={24} />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={disabled || !message.trim()}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                disabled || !message.trim()
                  ? "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
              }`}
              title="Send Message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </form>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="emoji-picker absolute bottom-full right-4 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl w-80 max-w-[calc(100vw-32px)] max-h-72 z-50 animate-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Choose an emoji
            </span>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Emoji Grid */}
          <div className="grid grid-cols-8 gap-1 p-3 max-h-48 overflow-y-auto">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="flex items-center justify-center w-8 h-8 text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-150 hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingArea;
