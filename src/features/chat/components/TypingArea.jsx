// TypingArea.jsx - Simple, responsive input + send button

import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

const TypingArea = ({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  disabled = false,
  placeholder = "Type a message...",
  className = "",
}) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Auto-resize textarea
    if (textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto";
      const maxHeight = 7 * 18; // ~7 lines * 18px
      el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
    }

    // Typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onStartTyping?.();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

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
    if (!trimmedMessage || disabled) return;

    onSendMessage?.({
      content: trimmedMessage,
      type: "text",
    });

    setMessage("");
    setIsTyping(false);
    onStopTyping?.();

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

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
        border-t border-gray-700 bg-gray-800
        px-3 py-2 md:px-4 md:py-3
        ${className}
      `}
    >
      <div className="max-w-6xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 md:gap-3"
        >
          {/* Input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="
    w-full bg-gray-700 border border-gray-600 
    rounded-full
    text-white placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-cyan-500
    resize-none overflow-hidden

    text-sm md:text-base
    h-10 md:h-12             /* same height as button */
    px-4                    /* balanced horizontal padding */

    leading-[2.4rem] md:leading-[3rem]  
    /* 👆 THIS centers placeholder vertically */
  "
            rows={1}
          />

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || disabled}
            className="
    flex items-center justify-center
    rounded-full
    w-10 h-10 md:w-12 md:h-12
    bg-cyan-500              /* perfect to your UI */
    text-white
    hover:bg-cyan-400        /* lighter and bright */
    active:scale-95
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  "
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TypingArea;
