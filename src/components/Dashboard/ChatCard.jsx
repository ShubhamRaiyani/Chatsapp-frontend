import React from "react";

export default function ChatCard({ chat, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded mb-2 cursor-pointer border ${
        selected
          ? "border-[#ae7aff] bg-[#3a1d6b]"
          : "border-transparent hover:bg-[#2b2b2b]"
      }`}
    >
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">{chat.displayName}</h4>
        <span className="text-xs text-gray-400">{chat.lastTimestamp}</span>
      </div>
      <p className="text-sm text-gray-300 truncate">{chat.lastMessage}</p>
    </div>
  );
}
