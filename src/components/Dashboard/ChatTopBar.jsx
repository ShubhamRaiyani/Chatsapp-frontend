import React from "react";
import { useChat } from "../../hooks/useChat";

export default function ChatTopBar({ chat }) {
  const { typing } = useChat();

  if (!chat) return null;

  return (
    <header className="flex items-center justify-between border-b border-gray-700 p-4 bg-[#2a2a2a] text-white">
      <div className="flex items-center space-x-3">
        {/* Avatar placeholder */}
        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-lg font-semibold">
          {chat.displayName.charAt(0).toUpperCase()}
        </div>

        <div>
          <h2 className="text-lg font-bold">{chat.displayName}</h2>
          {/* Status indicator */}
          {typing ? (
            <p className="text-sm text-[#ae7aff]">typing...</p>
          ) : (
            <p className="text-sm text-gray-400">
              {chat.type === "oneToOne"
                ? "Online"
                : `${chat.memberCount || 2} members`}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-2">
        <button
          className="p-2 hover:bg-gray-600 rounded-full transition-colors"
          onClick={() => console.log("Video call")}
          title="Video call"
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

        <button
          className="p-2 hover:bg-gray-600 rounded-full transition-colors"
          onClick={() => console.log("Voice call")}
          title="Voice call"
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

        <button
          className="p-2 hover:bg-gray-600 rounded-full transition-colors"
          onClick={() => console.log("Chat info")}
          title="Chat info"
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
