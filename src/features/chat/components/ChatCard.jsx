// chat/components/ChatCard.jsx - Mobile Responsive Version
import React from "react";
import Avatar from "./ui/Avatar";
import { formatLastActivityChatCard } from "../utils/dateUtils";

const ChatCard = ({
  chat,
  isActive = false,
  onClick,
  isMobile = false,
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

  // Use unreadCount from ChatDTO
  const hasUnreadMessages = (chat.unreadCount || 0) > 0;

  // Use lastMessage directly from ChatDTO
  const lastMessage = chat.lastMessage;

  return (
    <div
      onClick={onClick}
      className={`
    flex items-center gap-3 cursor-pointer transition-colors border-b border-gray-700/50
    ${isActive ? "bg-blue-600/20 border-blue-600/30" : "hover:bg-gray-700/50"}
    ${isMobile ? "p-3" : "p-4"}
    ${className}
  `}
    >
      {/* Avatar */}
      <Avatar
        src={getAvatarSrc()}
        alt={getChatTitle()}
        className={`flex-shrink-0 ${isMobile ? "w-10 h-10" : "w-12 h-12"}`}
        status={getStatus()}
      />

      {/* Chat content */}
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-center justify-between mb-1">
          <h3
            className={`
            font-medium text-white truncate
            ${isMobile ? "text-sm" : "text-base"}
          `}
          >
            {getChatTitle()}
          </h3>

          {/* Time and indicators */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {chat.lastActivityAt && (
              <span
                className={`
                text-gray-400
                ${isMobile ? "text-xs" : "text-sm"}
              `}
              >
                {formatLastActivityChatCard(chat.lastActivityAt)}
              </span>
            )}

            {/* Unread indicator */}
            {hasUnreadMessages && (
              <div
                className={`
                bg-blue-600 text-white rounded-full flex items-center justify-center font-medium
                ${isMobile ? "w-5 h-5 text-xs" : "w-6 h-6 text-sm"}
              `}
              >
                {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
              </div>
            )}
          </div>
        </div>

        {/* Last message */}
        <p
          className={`
          text-gray-400 truncate
          ${isMobile ? "text-xs" : "text-sm"}
        `}
        >
          {lastMessage || "No messages yet"}
        </p>

        {/* Additional indicators */}
        <div className="flex items-center gap-2 mt-1">
          {chat.isGroup && (
            <span
              className={`
              text-gray-500 flex items-center gap-1
              ${isMobile ? "text-xs" : "text-sm"}
            `}
            >
              <span>👥</span>
              {chat.participantEmails?.length || 0} members
            </span>
          )}

          {chat.archived && (
            <span
              className={`
              text-gray-500
              ${isMobile ? "text-xs" : "text-sm"}
            `}
            >
              📁 Archived
            </span>
          )}

          {chat.starred && <span className="text-yellow-500">⭐</span>}
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
