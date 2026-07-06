import React, { useState, useEffect, useRef } from "react";
import Avatar from "./ui/Avatar";
import { X, Users, Info, UserPlus, Search, LogOut, Check, Loader2 } from "lucide-react";
import ChatAPI from "../services/ChatAPI";
import UserAPI from "../services/UserAPI";
import webSocketService from "../services/WebSocketService";

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-xs text-gray-300">{value}</span>
  </div>
);

const ChatInfoPanel = ({
  chat,
  isOpen,
  onClose,
  currentUserId,
  onLeaveGroup,
  onMembersUpdated,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState("members");
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const [showAddSearch, setShowAddSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(null);

  const [onlineMap, setOnlineMap] = useState({});
  const searchTimerRef = useRef(null);

  // Subscribe to live presence
  useEffect(() => {
    const unsub = webSocketService.onPresence((event) => {
      setOnlineMap((prev) => ({ ...prev, [event.userId]: event.online }));
    });
    return unsub;
  }, []);

  // Seed initial presence when panel opens
  useEffect(() => {
    if (!isOpen) return;
    const emails = [
      ...(chat?.participantEmails || []),
      chat?.receiverEmail,
    ].filter(Boolean);
    const initial = {};
    emails.forEach((email) => {
      const val = webSocketService.isUserOnline(email);
      if (val !== null) initial[email] = val;
    });
    setOnlineMap((prev) => ({ ...initial, ...prev }));
  }, [isOpen]);

  // Reset add-member state when panel closes
  useEffect(() => {
    if (!isOpen) {
      setShowAddSearch(false);
      setSearchQuery("");
      setSelectedUsers([]);
      setConfirmLeave(false);
      setAddError(null);
    }
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Debounced user search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await UserAPI.searchUsers(searchQuery.trim());
        const existing = new Set(chat?.participantEmails || []);
        setSearchResults(
          results.filter((u) => !existing.has(u.email) && u.email !== currentUserId)
        );
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery]);

  const toggleSelect = (user) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u.email === user.email)
        ? prev.filter((u) => u.email !== user.email)
        : [...prev, user]
    );
  };

  const handleAddMembers = async () => {
    if (!selectedUsers.length || adding) return;
    setAdding(true);
    setAddError(null);
    try {
      await ChatAPI.addGroupMembers(chat.id, selectedUsers.map((u) => u.email));
      setShowAddSearch(false);
      setSelectedUsers([]);
      setSearchQuery("");
      onMembersUpdated?.();
    } catch (e) {
      setAddError(e.message || "Failed to add members");
    } finally {
      setAdding(false);
    }
  };

  const handleLeave = async () => {
    if (leaving) return;
    setLeaving(true);
    try {
      await onLeaveGroup(chat.id);
      onClose();
    } catch {
      // error handled upstream (ChatArea navigates back)
    } finally {
      setLeaving(false);
      setConfirmLeave(false);
    }
  };

  if (!chat) return null;

  const participants = (chat.participantEmails || []).map((email) => ({
    email,
    displayName: email.split("@")[0],
    isCurrentUser: email === currentUserId,
    isOnline: onlineMap[email] ?? webSocketService.isUserOnline(email) ?? false,
  }));

  const dmOnline =
    onlineMap[chat.receiverEmail] ??
    webSocketService.isUserOnline(chat.receiverEmail) ??
    false;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#111118] border-l border-white/[0.06] shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${className}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06] flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
          <h2 className="flex-1 text-sm font-semibold text-white">
            {chat.isGroup ? "Group Info" : "Contact Info"}
          </h2>
        </div>

        {/* Profile */}
        <div className="flex flex-col items-center py-6 px-4 border-b border-white/[0.06] flex-shrink-0">
          <div className="relative mb-3">
            <Avatar src={chat.avatar} name={chat.displayName} size="xl" />
            {!chat.isGroup && (
              <span
                className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-[#111118] ${
                  dmOnline ? "bg-emerald-400" : "bg-gray-500"
                }`}
              />
            )}
          </div>
          <h3 className="text-base font-semibold text-white">{chat.displayName}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {chat.isGroup
              ? `${participants.length} member${participants.length !== 1 ? "s" : ""}`
              : chat.receiverEmail}
          </p>
          {!chat.isGroup && (
            <p
              className={`text-xs mt-1 font-medium ${
                dmOnline ? "text-emerald-400" : "text-gray-500"
              }`}
            >
              {dmOnline ? "Online" : "Offline"}
            </p>
          )}
        </div>

        {/* Tabs (groups only) */}
        {chat.isGroup && (
          <div className="flex border-b border-white/[0.06] flex-shrink-0">
            {[
              { id: "info", label: "Info", icon: <Info size={13} /> },
              {
                id: "members",
                label: `Members (${participants.length})`,
                icon: <Users size={13} />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-400 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Info tab */}
          {(activeTab === "info" || !chat.isGroup) && (
            <div className="p-4">
              <div className="bg-white/[0.04] rounded-xl p-4 space-y-3">
                <InfoRow label="Type" value={chat.isGroup ? "Group Chat" : "Direct Message"} />
                {chat.lastActivity && (
                  <InfoRow
                    label="Last Active"
                    value={new Date(chat.lastActivity).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  />
                )}
                {chat.isGroup && (
                  <InfoRow label="Members" value={participants.length} />
                )}
              </div>
            </div>
          )}

          {/* Members tab */}
          {activeTab === "members" && chat.isGroup && (
            <div className="p-4 space-y-3">
              {/* Add members */}
              {!showAddSearch ? (
                <button
                  onClick={() => setShowAddSearch(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors"
                >
                  <UserPlus size={15} />
                  Add Members
                </button>
              ) : (
                <div className="space-y-3 bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                  {/* Search input */}
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                    />
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by email..."
                      className="w-full bg-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 border border-white/[0.08] focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>

                  {/* Loading */}
                  {searching && (
                    <div className="flex justify-center py-2">
                      <Loader2 size={16} className="animate-spin text-gray-500" />
                    </div>
                  )}

                  {/* Results */}
                  {!searching && searchResults.length > 0 && (
                    <div className="space-y-0.5 max-h-44 overflow-y-auto">
                      {searchResults.map((u) => {
                        const selected = selectedUsers.some((s) => s.email === u.email);
                        return (
                          <button
                            key={u.email}
                            onClick={() => toggleSelect(u)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                              selected
                                ? "bg-blue-500/20 border border-blue-500/30"
                                : "hover:bg-white/[0.04] border border-transparent"
                            }`}
                          >
                            <Avatar name={u.username || u.email} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">
                                {u.username || u.email.split("@")[0]}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{u.email}</p>
                            </div>
                            {selected && (
                              <Check size={14} className="text-blue-400 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {!searching && searchQuery.length >= 3 && searchResults.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-2">No users found</p>
                  )}
                  {searchQuery.length > 0 && searchQuery.length < 3 && (
                    <p className="text-xs text-gray-500 text-center py-1">
                      Type at least 3 characters
                    </p>
                  )}

                  {/* Selected pills */}
                  {selectedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedUsers.map((u) => (
                        <span
                          key={u.email}
                          className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300"
                        >
                          {u.username || u.email.split("@")[0]}
                          <button
                            onClick={() => toggleSelect(u)}
                            className="ml-0.5 hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {addError && (
                    <p className="text-xs text-red-400 text-center">{addError}</p>
                  )}

                  {/* Cancel / Add buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        setShowAddSearch(false);
                        setSelectedUsers([]);
                        setSearchQuery("");
                        setAddError(null);
                      }}
                      className="flex-1 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!selectedUsers.length || adding}
                      onClick={handleAddMembers}
                      className="flex-1 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
                    >
                      {adding && <Loader2 size={12} className="animate-spin" />}
                      {selectedUsers.length > 0 ? `Add (${selectedUsers.length})` : "Add"}
                    </button>
                  </div>
                </div>
              )}

              {/* Member list */}
              <div className="space-y-0.5">
                {participants.map((p) => (
                  <div
                    key={p.email}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar name={p.displayName} size="sm" />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#111118] ${
                          p.isOnline ? "bg-emerald-400" : "bg-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {p.displayName}
                        {p.isCurrentUser && (
                          <span className="ml-1.5 text-xs font-normal text-gray-500">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{p.email}</p>
                    </div>
                    {p.isOnline && (
                      <span className="text-xs text-emerald-400 flex-shrink-0">online</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer — leave group */}
        {chat.isGroup && (
          <div className="px-4 py-4 border-t border-white/[0.06] flex-shrink-0">
            {!confirmLeave ? (
              <button
                onClick={() => setConfirmLeave(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-400 text-sm font-medium hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
              >
                <LogOut size={15} />
                Leave Group
              </button>
            ) : (
              <div className="space-y-2.5">
                <p className="text-xs text-gray-400 text-center">
                  Leave &ldquo;{chat.displayName}&rdquo;? You won&apos;t receive new messages.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmLeave(false)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLeave}
                    disabled={leaving}
                    className="flex-1 py-2 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {leaving && <Loader2 size={12} className="animate-spin" />}
                    Leave
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ChatInfoPanel;
