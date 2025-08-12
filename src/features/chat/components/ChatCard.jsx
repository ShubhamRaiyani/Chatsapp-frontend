// chat/components/ChatCard.jsx - Updated for optimized ChatDTO

import React from "react";
import Avatar from "./ui/Avatar";
import { formatLastActivityChatCard } from "../utils/dateUtils";

const ChatCard = ({
  chat,
  isActive = false,
  onClick,
  currentUserId,
  className = "",
}) => {
  const getChatTitle = () => {
    console.log("getChatTitle called with chat:", chat);
    if (chat.isGroup) {
      return chat.displayName || "Group Chat";
    }
    return chat.displayName || "Unknown User";
  };

  const getAvatarSrc = () => {
    if (chat.isGroup) {
      return chat.avatar || "/group-default.png";
    }
    return chat.avatar || chat.participants?.[0]?.avatar;
  };

  const getStatus = () => {
    if (chat.isGroup) return null;
    return chat.participants?.[0]?.status;
  };

  // ✅ Use unreadCount from ChatDTO
  const hasUnreadMessages = (chat.unreadCount || 0) > 0;

  // ✅ Use lastMessage directly from ChatDTO
  const lastMessage = chat.lastMessage;

  return (
    <div
      className={`p-4 cursor-pointer transition-all duration-200 border-l-4 ${
        isActive
          ? "bg-gray-700 border-purple-500 shadow-lg"
          : "bg-gray-800 border-transparent hover:bg-gray-700"
      } ${className}`}
      onClick={() => onClick(chat)}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar with Status */}
        <div className="relative flex-shrink-0">
          <Avatar
            src={getAvatarSrc()}
            alt={getChatTitle()}
            size="md"
            status={getStatus()}
            showStatus={!chat.isGroup}
          />
          {/* Unread indicator */}
          {hasUnreadMessages && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-semibold">
                {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
              </span>
            </div>
          )}
        </div>

        {/* Chat Info */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h3
              className={`font-medium truncate ${
                isActive ? "text-white" : "text-gray-200"
              }`}
            >
              {getChatTitle()}
            </h3>
            <span
              className={`text-xs flex-shrink-0 ml-2 ${
                hasUnreadMessages
                  ? "text-purple-400 font-semibold"
                  : "text-gray-400"
              }`}
            >
              {chat.lastActivity
                ? formatLastActivityChatCard(chat.lastActivity)
                : ""}
            </span>
          </div>

          {/* Last Message */}
          <div className="flex items-center justify-between">
            <p
              className={`text-sm truncate ${
                hasUnreadMessages
                  ? "text-gray-200 font-medium"
                  : isActive
                  ? "text-gray-300"
                  : "text-gray-400"
              }`}
            >
              {lastMessage || "No messages yet"}
            </p>

            {/* Additional indicators */}
            <div className="flex items-center space-x-1 ml-2">
              {/* Group indicator */}
              {chat.isGroup && (
                <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-2.5 h-2.5 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}

              {/* Unread count badge */}
              {hasUnreadMessages && (
                <div className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="mt-2 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
      )}
    </div>
  );
};

export default ChatCard;
