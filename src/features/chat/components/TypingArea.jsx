// ========================================
// TypingArea.jsx - With Chat Summary Feature (AI Button)
// ========================================

import React, { useState, useRef, useEffect } from "react";

const TypingArea = ({
  onSendMessage,
  onTyping,
  onStopTyping,
  disabled = false,
  placeholder = "Type a message...",
  className = "",
  chatId = null,
  onSummarizeChat, // New prop for summary functionality
}) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
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

  const handleSummarizeChat = async () => {
    if (!chatId || isGeneratingSummary) return;

    setIsGeneratingSummary(true);
    try {
      await onSummarizeChat?.(chatId);
    } catch (error) {
      console.error("Failed to generate summary:", error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage && attachments.length === 0) return;

    onSendMessage?.({
      content: trimmedMessage,
      attachments: attachments,
      type: attachments.length > 0 ? "media" : "text",
    });

    // Reset form
    setMessage("");
    setAttachments([]);
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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => {
      const attachment = prev.find((att) => att.id === id);
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter((att) => att.id !== id);
    });
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
  ];

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      attachments.forEach((att) => {
        if (att.preview) {
          URL.revokeObjectURL(att.preview);
        }
      });
    };
  }, []);

  return (
    <div className={`typing-area-container ${className}`}>
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="attachments-preview">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="attachment-item">
              {attachment.preview ? (
                <img
                  src={attachment.preview}
                  alt=""
                  className="attachment-image"
                />
              ) : (
                <div className="attachment-file">
                  <span className="file-icon">📎</span>
                  <div className="file-info">
                    <span className="file-name">{attachment.name}</span>
                    <span className="file-size">{attachment.size}</span>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className="remove-attachment"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Input Area */}
      <form onSubmit={handleSubmit} className="typing-form">
        <div className="input-wrapper">
          {/* AI Summary Button - Left Side */}
          <button
            type="button"
            onClick={handleSummarizeChat}
            disabled={!chatId || isGeneratingSummary || disabled}
            className={`summary-button ${
              isGeneratingSummary ? "generating" : ""
            }`}
            title="Generate AI Summary (Last 2 Days)"
          >
            {isGeneratingSummary ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            ) : (
              "AI"
            )}
          </button>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="message-input"
            rows="1"
          />

          {/* Action Buttons - Right Side */}
          <div className="action-buttons">
            {/* File Upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="action-button attachment-button"
              title="Attach Files"
            >
              📎
            </button>

            {/* Emoji Picker */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabled}
              className="action-button emoji-button"
              title="Add Emoji"
            >
              😊
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={
                disabled || (!message.trim() && attachments.length === 0)
              }
              className="send-button"
              title="Send Message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="m22 2-7 20-4-9-9-4 20-7z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </form>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="emoji-picker">
          <div className="emoji-grid">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="emoji-item"
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
