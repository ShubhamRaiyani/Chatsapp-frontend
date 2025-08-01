// chat/components/ui/TypingIndicator.jsx
import React from "react";

const TypingIndicator = ({ users = [], className = "" }) => {
  if (!users || users.length === 0) return null;

  const renderTypingText = () => {
    if (users.length === 1) {
      return `${users[0].name} is typing...`;
    } else if (users.length === 2) {
      return `${users[0].name} and ${users[1].name} are typing...`;
    } else {
      return `${users[0].name} and ${users.length - 1} others are typing...`;
    }
  };

  return (
    <div
      className={`flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 ${className}`}
    >
      <div className="flex space-x-1">
        <div className="flex space-x-1">
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
      <span className="italic">{renderTypingText()}</span>
    </div>
  );
};

export default TypingIndicator;
