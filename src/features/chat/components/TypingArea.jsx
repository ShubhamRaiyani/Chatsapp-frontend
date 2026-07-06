import React, { useState, useRef, useEffect } from "react";
import { SendHorizonal } from "lucide-react";

const TypingArea = ({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  chatId,
  disabled = false,
  placeholder = "Type a message...",
  className = "",
}) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (chatId) textareaRef.current?.focus();
  }, [chatId]);

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    resizeTextarea();

    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onStartTyping?.();
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onStopTyping?.();
      }
    }, 1000);
  };

  const submit = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSendMessage?.({ content: trimmed, type: "text" });
    setMessage("");
    setIsTyping(false);
    onStopTyping?.();
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  useEffect(() => () => { if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current); }, []);

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div className={`px-4 py-3 bg-gray-900 ${className}`}>
      <div className="flex items-end gap-2 bg-[#1e2130] border border-white/[0.07] rounded-2xl px-3 py-2 transition-all focus-within:border-blue-500/50 focus-within:bg-[#1e2130]">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm resize-none outline-none leading-5 max-h-[120px] py-1 disabled:opacity-50"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          className={`
            flex-shrink-0 mb-0.5 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150
            ${canSend
              ? "bg-blue-600 text-white hover:bg-blue-500 active:scale-95 shadow-md shadow-blue-500/20"
              : "text-gray-600 cursor-not-allowed"
            }
          `}
        >
          <SendHorizonal size={15} strokeWidth={2.5} />
        </button>
      </div>

      {disabled && (
        <p className="text-center text-xs text-gray-600 mt-2">Reconnecting…</p>
      )}
    </div>
  );
};

export default TypingArea;
