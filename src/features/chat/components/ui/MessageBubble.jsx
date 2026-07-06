import React from "react";
import { formatMessageTime } from "../../utils/dateUtils";

const MessageBubble = ({ message, isOwn, isGrouped = false, UsernameofChat }) => {
  const messageType = message.type || message.messageType;
  const isSummary = messageType === "SUMMARY" || messageType === "Summary";
  const isImage = messageType === "image" || messageType === "IMAGE";

  const senderName = isOwn ? null : (message.senderUsername || message.senderName || UsernameofChat);

  const renderContent = () => {
    switch (messageType) {
      case "text":
      case "TEXT":
      default:
        return <p className="text-[0.875rem] leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>;

      case "SUMMARY":
      case "Summary":
        return (
          <div>
            <div className="flex items-center gap-2 mb-2.5 pb-2.5 border-b border-white/20">
              <span className="text-xs font-bold text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded">AI</span>
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wide">Summary · Last 2 days</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-100">{message.content}</p>
          </div>
        );

      case "image":
      case "IMAGE":
        return (
          <img
            src={message.content || message.imageUrl}
            alt="Shared image"
            className="rounded-xl max-w-full h-auto max-h-80 object-cover block"
            loading="lazy"
          />
        );

      case "file":
      case "FILE":
        return (
          <div className="flex items-center gap-3 p-2 bg-white/10 rounded-xl">
            <div className="w-9 h-9 bg-blue-500/80 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">FILE</div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{message.fileName || "File"}</p>
              {message.fileSize && <p className="text-xs text-white/60">{message.fileSize}</p>}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} ${isGrouped ? "mt-0.5" : "mt-3"} px-4`}>
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[72%] sm:max-w-[58%]`}>

        {/* Sender name for incoming group messages */}
        {!isOwn && !isGrouped && senderName && (
          <span className="text-[11px] font-semibold text-blue-400 mb-1 ml-1">{senderName}</span>
        )}

        {/* Bubble */}
        <div
          className={`
            relative px-3.5 py-2.5 shadow-sm
            ${isSummary
              ? "bg-gradient-to-br from-blue-600/90 to-indigo-700/90 rounded-2xl w-full max-w-none backdrop-blur-sm border border-white/10"
              : isOwn
                ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                : "bg-[#1e2130] text-gray-100 rounded-2xl rounded-tl-sm border border-white/5"
            }
            ${isImage ? "p-1 overflow-hidden" : ""}
          `}
        >
          <div className={isImage ? "" : "mb-1"}>{renderContent()}</div>

          {/* Timestamp */}
          <div className={`flex items-center justify-end mt-1 ${isImage ? "absolute bottom-2 right-2 bg-black/50 px-2 py-0.5 rounded-full" : ""}`}>
            <span className={`text-[10px] leading-none ${
              isSummary ? "text-blue-200/70" : isImage ? "text-white" : isOwn ? "text-white/60" : "text-gray-500"
            }`}>
              {formatMessageTime(message.sentAt || message.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
