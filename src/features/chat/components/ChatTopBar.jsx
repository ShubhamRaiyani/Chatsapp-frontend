import React, { useState, useEffect } from "react";
import Avatar from "./ui/Avatar";
import { ArrowLeft, Sparkles, MoreVertical, Info, Users, Phone, Video } from "lucide-react";
import { useCallContext } from "../../call/context/CallContext";

const ChatTopBar = ({
  chat,
  onShowInfo,
  onShowMembers,
  onBack,
  onSummarize,
  summaryLoading = false,
  isOtherUserOnline = false,
  className = "",
}) => {
  const { startCall, phase } = useCallContext();
  const inCall = phase !== "idle";
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
  const memberCount = chat?.participantEmails?.length || 0;
  const subtitle = chat?.isGroup ? `${memberCount} member${memberCount !== 1 ? "s" : ""}` : null;

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

      {/* Avatar with online dot for direct chats */}
      <div className="relative flex-shrink-0">
        <Avatar src={chat?.avatar || null} alt={title} size="md" />
        {!chat?.isGroup && (
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-900 transition-colors duration-300 ${
              isOtherUserOnline ? "bg-emerald-400" : "bg-gray-500"
            }`}
          />
        )}
      </div>

      {/* Title & status */}
      <div className="flex-1 min-w-0">
        <h2 className="text-[0.9rem] font-semibold text-white truncate leading-tight">{title}</h2>
        {chat?.isGroup ? (
          <p className="text-xs text-gray-500 truncate leading-tight mt-0.5">{subtitle}</p>
        ) : (
          <p className={`text-xs font-medium leading-tight mt-0.5 transition-colors duration-300 ${
            isOtherUserOnline ? "text-emerald-400" : "text-gray-500"
          }`}>
            {isOtherUserOnline ? "Online" : "Offline"}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Call buttons — only for 1-to-1 chats */}
        {!chat?.isGroup && (
          <>
            <button
              onClick={() => startCall(chat.id, chat.receiverEmail, "AUDIO", chat.displayName)}
              disabled={inCall}
              title="Voice call"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Phone size={18} />
            </button>
            <button
              onClick={() => startCall(chat.id, chat.receiverEmail, "VIDEO", chat.displayName)}
              disabled={inCall}
              title="Video call"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Video size={18} />
            </button>
          </>
        )}

        {/* AI Summary button */}
        {onSummarize && (
          <div className="relative group">
            <button
              onClick={() => onSummarize(chat?.id)}
              disabled={summaryLoading}
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

            {/* Tooltip */}
            {!summaryLoading && (
              <div className="absolute bottom-full right-0 mb-2.5 pointer-events-none
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all duration-150 z-50">
                <div className="bg-gray-800 border border-white/10 rounded-xl shadow-2xl px-3 py-2.5 w-48">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={12} className="text-blue-400 flex-shrink-0" />
                    <span className="text-white text-xs font-semibold">AI Summary</span>
                  </div>
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    Summarise the last 2 days of messages in this chat.
                  </p>
                </div>
                {/* Arrow */}
                <div className="absolute right-3 top-full w-2.5 h-2.5 overflow-hidden -mt-px">
                  <div className="w-2 h-2 bg-gray-800 border-r border-b border-white/10 rotate-45 -translate-y-1/2 translate-x-px" />
                </div>
              </div>
            )}
          </div>
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
