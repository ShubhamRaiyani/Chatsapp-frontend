import React, { useState, useRef, useEffect } from "react";
import { SendHorizonal, X, Reply, Pencil } from "lucide-react";

const TypingArea = ({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  chatId,
  disabled = false,
  placeholder = "Type a message...",
  className = "",
  replyTo = null,
  onCancelReply,
  editingMessage = null,
  onCancelEdit,
}) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // When edit mode activates, pre-fill and focus
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content || "");
      setTimeout(() => {
        const el = textareaRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
          resizeTextarea();
        }
      }, 0);
    }
  }, [editingMessage]);

  // Focus on chat switch or reply
  useEffect(() => {
    if (chatId && !editingMessage) {
      setMessage("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      textareaRef.current?.focus();
    }
  }, [chatId]);

  useEffect(() => {
    if (replyTo) textareaRef.current?.focus();
  }, [replyTo]);

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

    if (!editingMessage) {
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
    }
  };

  const cancelEdit = () => {
    setMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    onCancelEdit?.();
  };

  const submit = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSendMessage?.({ content: trimmed, type: "text" });
    setMessage("");
    setIsTyping(false);
    if (!editingMessage) onStopTyping?.();
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
    if (e.key === "Escape") {
      if (editingMessage) cancelEdit();
      else if (replyTo) onCancelReply?.();
    }
  };

  useEffect(() => () => { if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current); }, []);

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div className={`px-4 py-3 bg-gray-900 ${className}`}>

      {/* Edit mode banner */}
      {editingMessage && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-[#1e2130] border border-white/[0.07] rounded-xl">
          <Pencil size={14} className="text-yellow-400 flex-shrink-0" />
          <div className="flex-1 min-w-0 border-l-2 border-yellow-500 pl-2">
            <p className="text-[11px] font-semibold text-yellow-400">Editing message</p>
            <p className="text-xs text-gray-400 truncate">{editingMessage.content}</p>
          </div>
          <button
            onClick={cancelEdit}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Reply preview bar */}
      {!editingMessage && replyTo && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-[#1e2130] border border-white/[0.07] rounded-xl">
          <Reply size={14} className="text-blue-400 flex-shrink-0" />
          <div className="flex-1 min-w-0 border-l-2 border-blue-500 pl-2">
            <p className="text-[11px] font-semibold text-blue-400 truncate">
              {replyTo.senderEmail || "Unknown"}
            </p>
            <p className="text-xs text-gray-400 truncate">{replyTo.content || "Message"}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 bg-[#1e2130] border border-white/[0.07] rounded-2xl px-3 py-2 transition-all focus-within:border-blue-500/50">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={editingMessage ? "Edit message..." : placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm resize-none outline-none leading-5 max-h-[120px] py-1 disabled:opacity-50"
        />

        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          className={`
            flex-shrink-0 mb-0.5 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150
            ${canSend
              ? editingMessage
                ? "bg-yellow-500 text-white hover:bg-yellow-400 active:scale-95 shadow-md shadow-yellow-500/20"
                : "bg-blue-600 text-white hover:bg-blue-500 active:scale-95 shadow-md shadow-blue-500/20"
              : "text-gray-600 cursor-not-allowed"
            }
          `}
        >
          {editingMessage
            ? <Pencil size={14} strokeWidth={2.5} />
            : <SendHorizonal size={15} strokeWidth={2.5} />
          }
        </button>
      </div>

      {disabled && (
        <p className="text-center text-xs text-gray-600 mt-2">Reconnecting…</p>
      )}
    </div>
  );
};

export default TypingArea;
