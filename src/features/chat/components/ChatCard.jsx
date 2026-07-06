import React from "react";
import Avatar from "./ui/Avatar";
import { formatLastActivityChatCard } from "../utils/dateUtils";

const ChatCard = ({ chat, isActive = false, onClick, isMobile = false, className = "" }) => {
  const getChatTitle = () => {
    if (chat.isGroup) return chat.displayName || "Group Chat";
    return chat.displayName || "Unknown User";
  };

  const getAvatarSrc = () => {
    if (chat.isGroup) return chat.avatar || null;
    return chat.avatar || null;
  };

  const unreadCount = chat.unreadCount || 0;
  const hasUnread = unreadCount > 0;

  return (
    <div
      onClick={onClick}
      className={`
        relative flex items-center gap-3 cursor-pointer transition-all duration-150
        ${isMobile ? "px-3 py-3" : "px-4 py-3.5"}
        ${isActive
          ? "bg-blue-600/10 border-l-2 border-blue-500"
          : "border-l-2 border-transparent hover:bg-white/[0.03]"
        }
        ${className}
      `}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar
          src={getAvatarSrc()}
          alt={getChatTitle()}
          size={isMobile ? "md" : "lg"}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top row: name + time */}
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <span className={`font-semibold truncate ${isActive ? "text-white" : "text-gray-100"} ${isMobile ? "text-sm" : "text-[0.9rem]"}`}>
            {getChatTitle()}
          </span>
          {chat.lastActivity && (
            <span className={`flex-shrink-0 ${isMobile ? "text-[10px]" : "text-xs"} ${hasUnread ? "text-blue-400" : "text-gray-500"}`}>
              {formatLastActivityChatCard(chat.lastActivity)}
            </span>
          )}
        </div>

        {/* Bottom row: last message + unread badge */}
        <div className="flex items-center justify-between gap-2">
          <p className={`truncate ${isMobile ? "text-xs" : "text-sm"} ${hasUnread ? "text-gray-300" : "text-gray-500"}`}>
            {chat.lastMessage || "No messages yet"}
          </p>
          {hasUnread && (
            <span className={`
              flex-shrink-0 flex items-center justify-center
              bg-blue-500 text-white font-semibold rounded-full leading-none
              ${unreadCount > 9 ? "px-1.5 py-0.5 text-[10px] min-w-[20px]" : "w-5 h-5 text-[11px]"}
            `}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
