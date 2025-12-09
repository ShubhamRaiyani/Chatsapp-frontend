import React from "react";
// import Avatar from "./Avatar"; // Avatar no longer needed
import { formatMessageTime } from "../../utils/dateUtils";

const MessageBubble = ({
  message,
  isOwn,
  showAvatar = true, // Kept prop for compatibility but ignored
  isGrouped = false,
  currentUserId,
  UsernameofChat,
}) => {
  const messageType = message.type || message.messageType;
  const isSummary = messageType === "SUMMARY" || messageType === "Summary";

  const renderMessageContent = () => {
    switch (messageType) {
      case "text":
      case "TEXT":
        return (
          <div className="text-white text-sm leading-5 break-words">
            {message.content}
          </div>
        );

      case "SUMMARY":
      case "Summary":
        return (
          <div className="summary-content">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-600">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs">
                🤖
              </div>
              <span className="text-blue-200 text-sm font-medium">
                AI Chat Summary (Last 2 Days)
              </span>
            </div>
            <div className="text-gray-100 text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>
          </div>
        );

      case "image":
      case "IMAGE":
        return (
          <div className="image-message">
            <img
              src={message.content || message.imageUrl}
              alt="Shared image"
              className="rounded-lg max-w-full h-auto max-h-96 object-cover"
              loading="lazy"
            />
          </div>
        );

      case "file":
      case "FILE":
        return (
          <div className="flex items-center gap-3 p-2 bg-white/10 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              📎
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">
                {message.fileName || "File"}
              </div>
              {message.fileSize && (
                <div className="text-gray-400 text-xs">{message.fileSize}</div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-white text-sm leading-5 break-words">
            {message.content}
          </div>
        );
    }
  };

  return (
    <div
      className={`flex gap-2 mb-4 ${isOwn ? "justify-end" : "justify-start"} ${
        isGrouped ? "mt-1" : "mt-4"
      }`}
    >
      {/* 
        Avatar removed as per user request to clean up UI.
        Original logic: {showAvatar && !isOwn && ... <Avatar />} 
      */}

      {/* Message content container */}
      <div
        className={`flex flex-col max-w-[75%] sm:max-w-[60%] ${
          isOwn ? "items-end" : "items-start"
        }`}
      >
        {/* 
           Sender name removed as per user request.
           Original logic: {!isOwn && !isGrouped && <div className="text-gray-400...">...</div>}
        */}

        {/* Message bubble */}
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-sm ${
            isSummary
              ? "bg-gradient-to-r from-blue-600 to-blue-700 max-w-none w-full"
              : isOwn
              ? "bg-blue-500 text-white rounded-br-md"
              : "bg-gray-700 text-white rounded-bl-md"
          } ${messageType === "image" || messageType === "IMAGE" ? "p-1" : ""}`}
        >
          {/* Message content */}
          <div
            className={
              messageType === "image" || messageType === "IMAGE" ? "" : "mb-1"
            }
          >
            {renderMessageContent()}
          </div>

          {/* Message timestamp */}
          <div
            className={`flex items-center justify-end gap-1 mt-1 ${
              messageType === "image" || messageType === "IMAGE"
                ? "absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded-full"
                : ""
            }`}
          >
            <span
              className={`text-xs leading-none ${
                isSummary
                  ? "text-blue-100"
                  : messageType === "image" || messageType === "IMAGE"
                  ? "text-white"
                  : "text-gray-300"
              }`}
            >
              {formatMessageTime(message.sentAt || message.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
