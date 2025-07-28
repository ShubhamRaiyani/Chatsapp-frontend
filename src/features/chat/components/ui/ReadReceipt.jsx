// chat/components/ui/ReadReceipt.jsx
import React from "react";
import Avatar from "../Avatar";

const ReadReceipt = ({ message, users = [], className = "" }) => {
  if (!users || users.length === 0) return null;

  const readUsers = users.filter(
    (user) => message.readBy && message.readBy.includes(user.id)
  );

  if (readUsers.length === 0) return null;

  return (
    <div
      className={`flex items-center justify-end space-x-1 px-4 py-1 ${className}`}
    >
      <span className="text-xs text-gray-500">
        {readUsers.length === 1
          ? `Read by ${readUsers[0].name}`
          : `Read by ${readUsers.length} people`}
      </span>
      <div className="flex -space-x-1">
        {readUsers.slice(0, 3).map((user, index) => (
          <Avatar
            key={user.id}
            src={user.avatar}
            alt={user.name}
            size="sm"
            className="ring-2 ring-white"
            style={{ zIndex: readUsers.length - index }}
          />
        ))}
        {readUsers.length > 3 && (
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600 ring-2 ring-white">
            +{readUsers.length - 3}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadReceipt;
