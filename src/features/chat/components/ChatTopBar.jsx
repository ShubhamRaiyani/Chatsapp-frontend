import React, { useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(".dropdown-container")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

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
    return chat.receiverEmail || "Offline";
  };

  const getAvatarSrc = () => {
    return chat.avatar || null;
  };

  const getStatus = () => {
    if (chat.isGroup) return null;
    return "online";
  };

  return (
    <div
      className={`
      flex items-center justify-between p-3 md:p-4 bg-gray-800 border-b border-gray-700
      ${className}
    `}
    >
      {/* Left section with back button and chat info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Back button - only show on mobile */}
        {isMobile && onBack && (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        {/* Avatar */}
        <Avatar
          src={getAvatarSrc()}
          alt={getChatTitle()}
          className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0"
          status={getStatus()}
        />

        {/* Chat title and subtitle */}
        <div className="flex flex-col min-w-0 flex-1">
          <h2 className="font-medium text-white text-sm md:text-base truncate">
            {getChatTitle()}
          </h2>
          <div className="flex items-center gap-2">
            <p className="text-xs md:text-sm text-gray-400 truncate">
            </p>
            {chat?.isTyping && (
              <span className="text-xs text-blue-400 animate-pulse">
                typing...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right section - Action buttons */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Hide some buttons on mobile to save space */}

        {/* Summary button */}
        {onSummarize && (
          <button
            onClick={() => {
              onSummarize(chat.id)
              console.log("Summarize button clicked for chat ID:", chat.id);
            }}
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
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Sparkles
                size={28}
                className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
              />
            )}
            {!summaryLoading && (
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 opacity-70 blur-xl animate-pulse -z-10" />
            )}
          </button>
        )}

        {/* More options dropdown */}
        <div className="relative dropdown-container">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <MoreVertical size={16} className="md:w-5 md:h-5" />
          </button>

          {/* Mobile-friendly dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg border border-gray-600 z-50">
              <button
                onClick={() => {
                  onShowInfo?.(chat);
                  setShowDropdown(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-600 transition-colors"
              >
                <Info size={16} />
                <span>Chat Info</span>
              </button>
              {chat?.isGroup && (
                <button
                  onClick={() => {
                    onShowMembers?.(chat);
                    setShowDropdown(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-600 transition-colors rounded-b-lg"
                >
                  <Users size={16} />
                  <span>View Members</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatTopBar;
