import React, { useState, useEffect } from "react";
import Avatar from "./ui/Avatar";
import { ArrowLeft, Sparkles, MoreVertical, Info, Users } from "lucide-react";

const ChatTopBar = ({
  chat,
  onShowInfo,
  onShowMembers,
  onBack,
  onSummarize,
  summaryLoading = false,
  className = "",
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e) => {
      if (!e.target.closest(".topbar-dropdown")) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown]);

  const title = chat?.displayName || (chat?.isGroup ? "Group Chat" : "Unknown");
  const subtitle = chat?.isGroup
    ? `${chat.participantEmails?.length || 0} members`
    : chat?.receiverEmail || "";

  return (
    <div className={`flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-white/[0.06] ${className}`}>
      {/* Back (mobile) */}
      {isMobile && onBack && (
        <button
          onClick={onBack}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
      )}

      {/* Avatar */}
      <Avatar src={chat?.avatar || null} alt={title} size="md" className="flex-shrink-0" />

      {/* Title & subtitle */}
      <div className="flex-1 min-w-0">
        <h2 className="text-[0.9rem] font-semibold text-white truncate leading-tight">{title}</h2>
        {subtitle && (
          <p className="text-xs text-gray-500 truncate leading-tight mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* AI Summary button */}
        {onSummarize && (
          <button
            onClick={() => onSummarize(chat?.id)}
            disabled={summaryLoading}
            title="Generate AI Summary"
            className={`
              w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150
              ${summaryLoading
                ? "opacity-50 cursor-not-allowed bg-white/5"
                : "bg-blue-600/80 hover:bg-blue-500/80 shadow-md shadow-blue-500/20 active:scale-95"
              }
            `}
          >
            {summaryLoading
              ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Sparkles size={16} className="text-white" />
            }
          </button>
        )}

        {/* More menu */}
        <div className="relative topbar-dropdown">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <MoreVertical size={18} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1c1c28] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
              <button
                onClick={() => { onShowInfo?.(chat); setShowDropdown(false); }}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-gray-300 hover:bg-white/5 transition-colors text-left"
              >
                <Info size={15} className="text-gray-400" />
                Chat Info
              </button>
              {chat?.isGroup && (
                <button
                  onClick={() => { onShowMembers?.(chat); setShowDropdown(false); }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-gray-300 hover:bg-white/5 transition-colors text-left"
                >
                  <Users size={15} className="text-gray-400" />
                  View Members
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
