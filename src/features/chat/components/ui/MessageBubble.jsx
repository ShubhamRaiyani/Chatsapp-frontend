import React from "react";
import Avatar from "./Avatar";
import { formatMessageTime } from "../../utils/dateUtils";

const MessageBubble = ({
  message,
  isOwn,
  showAvatar = true,
  isGrouped = false,
  currentUserId,    
  UsernameofChat,
}) => {

  const messageType = message.type || message.messageType;
  const isSummary = messageType === "SUMMARY" || messageType === "Summary";

  const renderMessageContent = () => {
    switch (messageType) {
      case "text":
      case "TEXT":
        return <div className="message-text">{message.content}</div>;

      case "SUMMARY":
      case "Summary":
        return (
          <div className="summary-message-content">
            <div className="summary-header">
              <div className="summary-icon">🤖</div>
              <span className="summary-title">
                AI Chat Summary (Last 2 Days)
              </span>
            </div>
            <div className="summary-text">{message.content}</div>
          </div>
        );

      case "image":
      case "IMAGE":
        return (
          <div className="message-image">
            <img src={message.content || message.imageUrl} alt="Shared image" />
          </div>
        );

      case "file":
      case "FILE":
        return (
          <div className="message-file">
            <div className="file-icon">📎</div>
            <div className="file-info">
              <span className="file-name">{message.fileName || "File"}</span>
              <span className="file-size">{message.fileSize}</span>
            </div>
          </div>
        );

      default:
        return <div className="message-text">{message.content}</div>;
    }
  };


  return (
    <div
      className={`message-bubble ${isOwn ? "own" : "other"} ${
        isGrouped ? "grouped" : ""
      } ${isSummary ? "summary-message" : ""}`}
    >
      {showAvatar && !isOwn && !isGrouped && (
        <Avatar user={message.sender} size="sm" className="message-avatar" />
      )}

      <div className="message-content">
        {!isOwn && !isGrouped && (
          <div className="message-sender">
            {message.sender?.username || UsernameofChat || "Unknown"}
          </div>
        )}

        <div className={`message-body ${isSummary ? "summary-body" : ""}`}>
          {renderMessageContent()}

          <div className="message-footer">
            <span className="message-time">
              {formatMessageTime(message.sentAt || message.createdAt)}
            </span>

            {isOwn && <></>}
          </div>
        </div>

        {/* {renderReactions()} */}

        {/* {showActions && !isSummary && (
          <div className="message-actions">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="action-button"
              title="React"
            >
              😊
            </button>

            {isOwn && (
              <>
                <button
                  onClick={handleEdit}
                  className="action-button"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={handleDelete}
                  className="action-button"
                  title="Delete"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        )} */}

        {/* {showReactions && (
          <div className="reaction-picker">
            {["👍", "❤️", "😂", "😮", "😢", "😡"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="reaction-option"
              >
                {emoji}
              </button>
            ))}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default MessageBubble;
