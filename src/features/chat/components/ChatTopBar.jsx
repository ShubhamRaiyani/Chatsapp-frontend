import React, { useState } from "react";
import Avatar from "./ui/Avatar";
import {
  Phone,
  Video,
  Info,
  Users,
  MoreVertical,
  ArrowLeft,
  Search,
  Sparkles,
} from "lucide-react";

const ChatTopBar = ({
  chat,
  onStartCall,
  onStartVideoCall,
  onShowInfo,
  onShowMembers,
  onBack,
  onSummarize,
  summaryLoading = false,
  className = "",
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getChatTitle = () => {
    if (chat.isGroup) {
      return chat.displayName || "Group Chat";
    }
    return chat.displayName || "Unknown User";
  };

  const getChatSubtitle = () => {
    if (chat.isGroup) {
      const memberCount = chat.participantEmails?.length || 0;
      return `${memberCount} member${memberCount !== 1 ? "s" : ""}`;
    }

    // For direct chats, show the receiver email
    return chat.receiverEmail || "Offline";
  };

  const getAvatarSrc = () => {
    if (chat.isGroup) {
      return chat.avatar || null;
    }
    return chat.avatar || null;
  };

  const getStatus = () => {
    if (chat.isGroup) return null;
    return "online"; // You can make this dynamic based on real status
  };

  return (
    <div
      className={`
      flex items-center justify-between px-4 py-3 
      bg-white dark:bg-gray-800 
      border-b border-gray-200 dark:border-gray-700
      ${className}
    `}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Mobile Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        )}

        {/* Chat Avatar */}
        <Avatar
          src={getAvatarSrc()}
          name={getChatTitle()}
          size="md"
          status={getStatus()}
        />

        {/* Chat Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {getChatTitle()}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {getChatSubtitle()}
          </p>
          {chat?.isTyping && (
            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
              <div className="flex gap-1">
                <div
                  className="w-1 h-1 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-1 h-1 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-1 h-1 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
              <span>typing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex items-center gap-2">
  

        {/* Summarize Button */}
        {onSummarize && (
          <button
            onClick={() => onSummarize(chat.id)}
            disabled={summaryLoading}
            className="
    relative p-3 rounded-full
    bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500
    text-white shadow-lg
    transition-all duration-300
    hover:scale-110 hover:shadow-2xl
    disabled:opacity-50 disabled:cursor-not-allowed
  "
            title="Generate Chat Summary"
          >
            {summaryLoading ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <Sparkles
                size={28}
                className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
              />
            )}

            {/* Glowing aura behind the button */}
            {!summaryLoading && (
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 opacity-70 blur-xl animate-pulse -z-10"></span>
            )}
          </button>
        )}

        {/* Info/Members Button */}
        <button
          onClick={chat.isGroup ? onShowMembers : onShowInfo}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          title={chat.isGroup ? "View Members" : "Chat Info"}
        >
          {chat.isGroup ? (
            <Users size={20} className="text-gray-600 dark:text-gray-400" />
          ) : (
            <Info size={20} className="text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Backdrop for dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default ChatTopBar;
