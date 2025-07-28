import React from "react";

const EmptyState = ({
  type = "chat",
  title,
  description,
  action,
  icon,
  className = "",
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case "chat":
      case "no-chat":
        return {
          title: "Select a chat to start messaging",
          description:
            "Choose a conversation from the sidebar to begin chatting",
          icon: (
            <div className="w-20 h-20 bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] rounded-2xl flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          ),
        };
      case "messages":
      case "no-messages":
        return {
          title: "No messages yet",
          description: "Start the conversation by sending your first message",
          icon: (
            <div className="w-16 h-16 bg-[#262626] rounded-xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 8h10m0 0V18a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0l-5-3-5 3"
                />
              </svg>
            </div>
          ),
        };
      case "search":
        return {
          title: "No results found",
          description: "Try adjusting your search terms or check your spelling",
          icon: (
            <div className="w-16 h-16 bg-[#262626] rounded-xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          ),
        };
      case "error":
        return {
          title: "Something went wrong",
          description:
            "Please try again or contact support if the problem persists",
          icon: (
            <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          ),
        };
      default:
        return {
          title: "Nothing here yet",
          description: "Content will appear here when available",
          icon: (
            <div className="w-16 h-16 bg-[#262626] rounded-xl flex items-center justify-center">
              <span className="text-2xl">📭</span>
            </div>
          ),
        };
    }
  };

  const defaultContent = getDefaultContent();

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 h-full ${className}`}
    >
      <div className="mb-6">{icon || defaultContent.icon}</div>

      <h3 className="text-xl font-semibold text-white mb-3">
        {title || defaultContent.title}
      </h3>

      {(description || defaultContent.description) && (
        <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
          {description || defaultContent.description}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
export default EmptyState;