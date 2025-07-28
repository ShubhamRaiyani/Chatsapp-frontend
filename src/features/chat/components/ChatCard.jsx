// chat/components/ChatCard.jsx - Dark Theme Redesign
import React from "react";
import Avatar from "./Avatar";
import { formatChatTime } from "../utils/dateUtils";

const ChatCard = ({
  chat,
  isActive = false,
  onClick,
  currentUserId,
  className = "",
}) => {
  const getChatTitle = () => {
    if (chat.type === "group") {
      return chat.name || "Group Chat";
    }
    return chat.participants?.[0]?.name || "Unknown User";
  };

  const getLastMessage = () => {
    if (!chat.lastMessage) return "";

    const { content, type, senderId } = chat.lastMessage;
    const senderName = chat.participants?.find((p) => p.id === senderId)?.name;
    const isOwn = senderId === currentUserId;

    let messagePreview = "";

    switch (type) {
      case "text":
        messagePreview = content;
        break;
      case "image":
        messagePreview = "📷 Photo";
        break;
      case "file":
        messagePreview = "📎 File";
        break;
      case "voice":
        messagePreview = "🎵 Voice message";
        break;
      case "video":
        messagePreview = "🎥 Video";
        break;
      default:
        messagePreview = content;
    }

    if (chat.type === "group" && !isOwn && senderName) {
      return `${senderName}: ${messagePreview}`;
    }

    if (isOwn) {
      return `You: ${messagePreview}`;
    }

    return messagePreview;
  };

  const getAvatarSrc = () => {
    if (chat.type === "group") {
      return chat.avatar || "/group-default.png";
    }
    return chat.participants?.[0]?.avatar;
  };

  const getStatus = () => {
    if (chat.type === "group") return null;
    return chat.participants?.[0]?.status;
  };

  const hasUnreadMessages = chat.unreadCount > 0;
  const lastMessage = getLastMessage();

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center p-4 mx-2 rounded-xl cursor-pointer transition-all duration-200 ${
        isActive
          ? "bg-[#7C3AED] shadow-lg transform scale-[1.02]"
          : "hover:bg-[#262626] active:bg-[#404040]"
      } ${className}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mr-3 relative">
        <Avatar
          src={getAvatarSrc()}
          alt={getChatTitle()}
          size="lg"
          status={getStatus()}
          className={`${isActive ? "ring-2 ring-white/20" : ""}`}
        />
        {chat.type === "group" && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
        )}
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0 mr-3">
        {/* Title and Time */}
        <div className="flex items-center justify-between mb-1">
          <h4
            className={`font-semibold truncate text-sm ${
              isActive
                ? "text-white"
                : hasUnreadMessages
                ? "text-white"
                : "text-gray-200"
            }`}
          >
            {getChatTitle()}
          </h4>
          <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
            {chat.lastMessage?.timestamp && (
              <span
                className={`text-xs ${
                  isActive
                    ? "text-white/80"
                    : hasUnreadMessages
                    ? "text-[#7C3AED]"
                    : "text-gray-400"
                }`}
              >
                {formatChatTime(chat.lastMessage.timestamp)}
              </span>
            )}
          </div>
        </div>

        {/* Last Message */}
        <div className="flex items-center justify-between">
          <p
            className={`text-sm truncate ${
              isActive
                ? "text-white/90"
                : hasUnreadMessages
                ? "text-gray-300 font-medium"
                : "text-gray-400"
            }`}
          >
            {lastMessage || "No messages yet"}
          </p>
        </div>

        {/* Typing Indicator */}
        {chat.isTyping && (
          <div className="flex items-center space-x-1 mt-1">
            <div className="flex space-x-1">
              <div
                className="w-1 h-1 bg-[#7C3AED] rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-1 h-1 bg-[#7C3AED] rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-1 h-1 bg-[#7C3AED] rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
            <span className="text-xs text-[#7C3AED] italic">typing...</span>
          </div>
        )}
      </div>

      {/* Status Indicators */}
      <div className="flex flex-col items-end space-y-2">
        {/* Unread Badge */}
        {hasUnreadMessages && (
          <div
            className={`px-2 py-1 rounded-full text-xs font-semibold min-w-[20px] h-5 flex items-center justify-center ${
              isActive ? "bg-white text-[#7C3AED]" : "bg-[#7C3AED] text-white"
            }`}
          >
            {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
          </div>
        )}

        {/* Status Icons */}
        <div className="flex items-center space-x-1">
          {/* Muted */}
          {chat.muted && (
            <div
              className={`p-1 rounded ${
                isActive ? "bg-white/20" : "bg-gray-600"
              }`}
            >
              <svg
                className={`w-3 h-3 ${
                  isActive ? "text-white" : "text-gray-400"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.69 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.69l3.693-3.793zM12 8a1 1 0 011.414 0L15 9.586l1.586-1.586A1 1 0 1118 9.414L16.414 11 18 12.586A1 1 0 0116.586 14L15 12.414 13.414 14A1 1 0 0112 12.586L13.586 11 12 9.414A1 1 0 0112 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}

          {/* Pinned */}
          {chat.pinned && (
            <div
              className={`p-1 rounded ${
                isActive ? "bg-white/20" : "bg-gray-600"
              }`}
            >
              <svg
                className={`w-3 h-3 ${
                  isActive ? "text-white" : "text-gray-400"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
              </svg>
            </div>
          )}

          {/* Message Status (for own messages) */}
          {chat.lastMessage?.senderId === currentUserId && (
            <div className="flex items-center">
              {chat.lastMessage?.readBy?.length > 0 ? (
                <svg
                  className={`w-4 h-4 ${
                    isActive ? "text-white" : "text-[#22C55E]"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                    transform="translate(2, 0)"
                  />
                </svg>
              ) : (
                <svg
                  className={`w-4 h-4 ${
                    isActive ? "text-white/60" : "text-gray-500"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      {!isActive && (
        <div className="absolute inset-y-0 left-0 w-1 bg-[#7C3AED] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      )}

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute inset-y-0 left-0 w-1 bg-white rounded-full"></div>
      )}
    </div>
  );
};

export default ChatCard;
