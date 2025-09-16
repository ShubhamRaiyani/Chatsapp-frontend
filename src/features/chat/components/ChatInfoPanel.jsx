import React, { useState, useEffect } from "react";
import Avatar from "./ui/Avatar";
import {
  X,
  Users,
  MessageCircle,
  Settings,
  Bell,
  Shield,
  Trash2,
} from "lucide-react";

const ChatInfoPanel = ({
  chat,
  isOpen,
  onClose,
  currentUserId,
  onMuteChat,
  onDeleteChat,
  onLeaveGroup,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState("info");

  // Auto-close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent scroll
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!chat) return null;

  const getParticipants = () => {
    if (!chat.isGroup || !chat.participantEmails) return [];
    return chat.participantEmails.map((email) => ({
      email,
      displayName: email.split("@"),
      isCurrentUser: email === currentUserId,
      status: "offline", // Enhance with real status
    }));
  };

  const participants = getParticipants();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chat Information
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "info"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <MessageCircle size={16} className="inline mr-2" />
            Info
          </button>
          {chat.isGroup && (
            <button
              onClick={() => setActiveTab("members")}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === "members"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              <Users size={16} className="inline mr-2" />
              Members ({participants.length})
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "info" && (
            <div className="p-6 space-y-6">
              {/* Chat Avatar and Name */}
              <div className="text-center">
                <Avatar
                  src={chat.avatar}
                  name={chat.displayName}
                  size="xl"
                  status={chat.isGroup ? null : "online"}
                />
                <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                  {chat.displayName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {chat.isGroup
                    ? `${participants.length} members`
                    : chat.receiverEmail}
                </p>
              </div>

              {/* Chat Details */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Chat Details
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type:</span>
                    <span className="text-gray-900 dark:text-white">
                      {chat.isGroup ? "Group Chat" : "Direct Message"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Activity:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(chat.lastActivity).toLocaleDateString()}
                    </span>
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Unread Messages:</span>
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                        {chat.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => onMuteChat?.(chat.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Bell size={20} />
                  <span>Mute Notifications</span>
                </button>

                {chat.isGroup && (
                  <button
                    onClick={() => onLeaveGroup?.(chat.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Shield size={20} />
                    <span>Leave Group</span>
                  </button>
                )}

                <button
                  onClick={() => onDeleteChat?.(chat.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 size={20} />
                  <span>Delete Chat</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "members" && chat.isGroup && (
            <div className="p-6">
              <div className="space-y-1">
                {participants.map((participant) => (
                  <div
                    key={participant.email}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Avatar
                      name={participant.displayName}
                      size="md"
                      status={participant.status}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {participant.displayName}
                        {participant.isCurrentUser && (
                          <span className="ml-2 text-xs text-blue-600">
                            (You)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {participant.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatInfoPanel;
