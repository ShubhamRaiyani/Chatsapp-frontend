import React, { useState } from "react";
import Avatar from "./Avatar";
import { formatMessageTime } from "../utils/dateUtils";

const MessageBubble = ({
  message,
  isOwn,
  showAvatar = true,
  isGrouped = false,
  onEdit,
  onDelete,
  onReact,
  currentUserId,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const handleEdit = () => {
    if (onEdit) onEdit(message.id);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(message.id);
  };

  const handleReaction = (emoji) => {
    if (onReact) onReact(message.id, emoji);
    setShowReactions(false);
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case "text":
        return (
          <div className="space-y-1">
            {message.edited && (
              <span className="text-xs text-gray-400 italic">edited</span>
            )}
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </p>
          </div>
        );
      case "image":
        return (
          <div className="max-w-xs">
            <div className="relative rounded-xl overflow-hidden bg-[#262626]">
              <img
                src={message.fileUrl}
                alt="Shared image"
                className="w-full h-auto max-h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
            </div>
            {message.content && (
              <p className="text-sm mt-2 whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
          </div>
        );
      case "file":
        return (
          <div className="flex items-center space-x-3 p-3 bg-[#262626] rounded-xl max-w-xs">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-[#7C3AED] rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {message.fileName}
              </p>
              <p className="text-xs text-gray-400">{message.fileSize}</p>
            </div>
            <button className="flex-shrink-0 p-2 hover:bg-[#404040] rounded-lg transition-colors">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
            </button>
          </div>
        );
      case "voice":
        return (
          <div className="flex items-center space-x-3 p-3 bg-[#262626] rounded-xl">
            <button className="flex-shrink-0 w-10 h-10 bg-[#7C3AED] rounded-full flex items-center justify-center hover:bg-[#8B5CF6] transition-colors">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-1 bg-[#404040] rounded-full">
                  <div className="w-1/3 h-full bg-[#7C3AED] rounded-full"></div>
                </div>
                <span className="text-xs text-gray-400">0:23</span>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        );
    }
  };

  return (
    <div
      className={`flex items-end space-x-3 group ${
        isOwn ? "flex-row-reverse space-x-reverse" : ""
      } ${isGrouped ? "mt-1" : "mt-4"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {showAvatar && !isGrouped && !isOwn && (
        <div className="flex-shrink-0">
          <Avatar
            src={message.sender?.avatar}
            alt={message.sender?.name || "User"}
            size="sm"
            status={message.sender?.status}
          />
        </div>
      )}

      {/* Message Container */}
      <div
        className={`flex flex-col ${
          isOwn ? "items-end" : "items-start"
        } max-w-xs lg:max-w-md`}
      >
        {/* Sender Name */}
        {!isGrouped && !isOwn && (
          <span className="text-xs text-gray-400 mb-1 px-3 font-medium">
            {message.sender?.name}
          </span>
        )}

        {/* Message Bubble */}
        <div className="relative">
          <div
            className={`px-4 py-3 rounded-2xl ${
              isOwn ? "bg-[#7C3AED] text-white" : "bg-[#262626] text-white"
            } ${
              isGrouped ? (isOwn ? "rounded-br-md" : "rounded-bl-md") : ""
            } shadow-lg`}
          >
            {renderMessageContent()}
          </div>

          {/* Message Reactions */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(message.reactions).map(([emoji, users]) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={`text-xs px-2 py-1 rounded-full border transition-all hover:scale-105 ${
                    users.includes(currentUserId)
                      ? "bg-[#7C3AED]/20 border-[#7C3AED] text-[#7C3AED]"
                      : "bg-[#262626] border-[#404040] text-gray-300 hover:border-gray-300"
                  }`}
                >
                  {emoji} {users.length}
                </button>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div
              className={`absolute top-0 ${
                isOwn ? "left-0 -translate-x-full" : "right-0 translate-x-full"
              } flex items-center space-x-1 bg-[#262626] shadow-xl rounded-lg p-1 border border-[#404040]`}
            >
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="p-2 hover:bg-[#404040] rounded-lg transition-colors text-gray-300 hover:text-white"
                title="React"
              >
                <span className="text-sm">😊</span>
              </button>
              {isOwn && (
                <>
                  <button
                    onClick={handleEdit}
                    className="p-2 hover:bg-[#404040] rounded-lg transition-colors text-gray-300 hover:text-white"
                    title="Edit"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-gray-300 hover:text-red-400"
                    title="Delete"
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
                  </button>
                </>
              )}
            </div>
          )}

          {/* Reaction Picker */}
          {showReactions && (
            <div className="absolute top-full mt-2 bg-[#262626] shadow-xl rounded-xl p-3 flex space-x-2 z-20 border border-[#404040]">
              {["😀", "😂", "❤️", "👍", "👎", "😮", "😢", "😡", "🎉", "🔥"].map(
                (emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="text-xl hover:bg-[#404040] rounded-lg p-2 transition-all hover:scale-110"
                  >
                    {emoji}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Message Time */}
        <div
          className={`flex items-center space-x-2 mt-1 px-3 ${
            isOwn ? "flex-row-reverse" : ""
          }`}
        >
          <span className="text-xs text-gray-400">
            {formatMessageTime(message.timestamp)}
          </span>
          {/* Read Receipt */}
          {isOwn && message.readBy && message.readBy.length > 0 && (
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-[#22C55E]"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default MessageBubble;
