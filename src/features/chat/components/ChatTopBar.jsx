// ========================================
// ChatTopBar.jsx - Dark Theme Redesign
// ========================================
import React, { useState } from "react";
import Avatar from "./ui/Avatar";

const ChatTopBar = ({
  chat,
  onStartCall,
  onStartVideoCall,
  onShowInfo,
  onShowMembers,
  className = "",
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getChatTitle = () => {
    if (chat.isGroup) {
      return chat.displayName || "Group Chat";
    }
    return chat.displayName || "Unknowns User";
  };

  const getChatSubtitle = () => {
    if (chat.isGroup) {
      const memberCount = chat.participants?.length || 0;
      const onlineCount =
        chat.participants?.filter((p) => p.status === "online").length || 0;
      return `${memberCount} members${
        onlineCount > 0 ? `, ${onlineCount} online` : ""
      }`;
    }
    const user = chat?.participants?.[0];
    if (user?.status === "online") {
      return "Online";
    } else if (user?.lastSeen) {
      return `Last seen ${user.lastSeen}`;
    }
    return "Offline";
  };

  const getAvatarSrc = () => {
    if (chat.isGroup) {
      return chat.avatar || "/group-default.png";
    }
    return chat.avatar;
  };

  const getStatus = () => {
    if (chat.isGroup ) return null;
    return chat?.participants?.[0]?.status;
  };

  return (
    <div
      className={`flex items-center justify-between p-4 bg-[#1A1A1A] border-b border-[#262626] ${className}`}
    >
      {/* Chat Info */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <Avatar
          src={getAvatarSrc()}
          alt={getChatTitle()}
          size="lg"
          status={getStatus()}
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-lg truncate">
            {getChatTitle()}
          </h3>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-400 truncate">
              {getChatSubtitle()}
            </p>
            {chat?.isTyping && (
              <div className="flex items-center space-x-1">
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
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {/* Search in Chat */}
        <button
          className="p-2 text-gray-400 hover:text-white hover:bg-[#393939] rounded-xl transition-colors"
          title="Search in chat"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        {/* Voice Call (Direct chats only) */}
        {chat?.type === "direct" && (
          <button
            onClick={onStartCall}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#393939] rounded-xl transition-colors"
            title="Start voice call"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>
        )}

        {/* Video Call (Direct chats only) */}
        {chat?.type === "direct" && (
          <button
            onClick={onStartVideoCall}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#393939] rounded-xl transition-colors"
            title="Start video call"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        )}

        {/* More Options */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#393939] rounded-xl transition-colors"
            title="More options"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-[#262626] rounded-xl shadow-2xl py-2 z-50 border border-[#404040]">
                <button
                  onClick={() => {
                    onShowInfo?.();
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[#404040] transition-colors flex items-center space-x-3"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Chat Info</span>
                </button>

                {chat.isGroup && (
                  <button
                    onClick={() => {
                      onShowMembers?.();
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[#404040] transition-colors flex items-center space-x-3"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                    <span>View Members ({chat.participants?.length || 0})</span>
                  </button>
                )}

                {/* <button
                  onClick={() => {
                    // Handle pin/unpin
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[#404040] transition-colors flex items-center space-x-3"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  <span>{chat?.pinned ? "Unpin" : "Pin"} Chat</span>
                </button> */}

                <button
                  onClick={() => {
                    // Handle mute/unmute
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[#404040] transition-colors flex items-center space-x-3"
                >
                  {chat?.muted ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.69 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.69l3.693-3.793zM12 8a1 1 0 011.414 0L15 9.586l1.586-1.586A1 1 0 1118 9.414L16.414 11 18 12.586A1 1 0 0116.586 14L15 12.414 13.414 14A1 1 0 0112 12.586L13.586 11 12 9.414A1 1 0 0112 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span>{chat?.muted ? "Unmute" : "Mute"} Chat</span>
                </button>

                <button
                  onClick={() => {
                    // Handle starred messages
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[#404040] transition-colors flex items-center space-x-3"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <span>Starred Messages</span>
                </button>

                <div className="border-t border-[#404040] my-2"></div>

                <button
                  onClick={() => {
                    // Handle archive
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[#404040] transition-colors flex items-center space-x-3"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8l4 4m0 0l4-4m-4 4v12m-6-8a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8z"
                    />
                  </svg>
                  <span>Archive Chat</span>
                </button>

                <button
                  onClick={() => {
                    // Handle delete
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-[#404040] transition-colors flex items-center space-x-3"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Delete Chat</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatTopBar;
