import React, { useState, useEffect, useRef } from "react";
import Avatar from "./ui/Avatar";
import UserAPI from "../services/UserAPI";

const NewChatModal = ({ isOpen, onClose, onCreateChat, onCreateGroup, className = "" }) => {
  const [mode, setMode] = useState("direct");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);

  const searchUsers = async (q) => {
    const trimmed = q.trim();
    if (trimmed.length < 3) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    try {
      const users = await UserAPI.searchUsers(trimmed);
      setSearchResults(users || []);
      if (users.length === 0) setSearchError("No users found");
    } catch {
      setSearchError("Failed to search users");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 3) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }
    debounceRef.current = setTimeout(() => searchUsers(val), 500);
  };

  const handleCreateDirect = async (user) => {
    if (!user || isCreating) return;
    setIsCreating(true);
    try {
      await onCreateChat(user.email);
      handleClose();
    } catch {
      setSearchError("Failed to create chat");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUserSelect = (user) => {
    if (mode === "direct") {
      handleCreateDirect(user);
    } else {
      const exists = selectedUsers.some((u) => u.email === user.email);
      setSelectedUsers(exists ? selectedUsers.filter((u) => u.email !== user.email) : [...selectedUsers, user]);
    }
  };

  const handleCreateGroup = async () => {
    if (step === 1) {
      if (!selectedUsers.length) return;
      setStep(2);
      return;
    }
    if (isCreating) return;
    setIsCreating(true);
    try {
      const emails = selectedUsers.map((u) => u.email);
      await onCreateGroup(groupName.trim() || "New Group", emails);
      handleClose();
    } catch {
      setSearchError("Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setMode("direct");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUsers([]);
    setGroupName("");
    setStep(1);
    setSearchError(null);
    setIsCreating(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
    return () => clearTimeout(debounceRef.current);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-gray-800 rounded-lg w-full max-w-md h-[80vh] flex flex-col ${className}`}>
        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button onClick={() => { setMode("direct"); setStep(1); setSelectedUsers([]); }} className={`flex-1 py-3 text-center text-white cursor-pointer ${mode === "direct" ? "border-b-2 border-purple-500 font-semibold" : ""}`}>Direct</button>
          <button onClick={() => { setMode("group"); setStep(1); setSelectedUsers([]); }} className={`flex-1 py-3 text-center text-white cursor-pointer ${mode === "group" ? "border-b-2 border-purple-500 font-semibold" : ""}`}>Group</button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 shrink-0">
          <h2 className="text-lg font-semibold text-white">{mode === "direct" ? "New Chat" : step === 1 ? "Select Members" : "Group Details"}</h2>
          <button onClick={handleClose} disabled={isCreating} className="p-1 rounded-full hover:bg-gray-700 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {mode === "direct" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="relative px-4 pt-4">
                <input type="text" ref={searchInputRef} placeholder="Search email (min 3 chars)..." className="w-full rounded-lg px-4 py-2 pl-10 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" value={searchQuery} onChange={handleSearchChange} disabled={isCreating} />
                <svg className="absolute left-6 top-6 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
                </svg>
              </div>
              <div className="flex-1 overflow-auto mt-2 px-4">
                {isSearching && <div className="text-center text-gray-400 py-4">Searching...</div>}
                {searchError && <div className="text-center text-red-400 py-4">{searchError}</div>}
                {!isSearching && !searchError && searchResults.length === 0 && searchQuery.trim().length >= 3 && (
                  <div className="text-center text-gray-400 py-4">No results found</div>
                )}
                {searchResults.length > 0 && (
                  <div className="divide-y divide-gray-700">
                    {searchResults.map(user => {
                      const selected = selectedUsers.some(u => u.email === user.email);
                      return (
                        <div key={user.email} onClick={() => !isCreating && handleUserSelect(user)} className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-700 rounded ${selected ? "bg-gray-700" : ""}`}>
                          <Avatar src={user.avatar} name={user.username || user.email} size="sm" status="offline" />
                          <div className="ml-3 flex-grow">
                            <div className="text-white font-medium">{user.username || "User"}</div>
                            <div className="text-gray-400 text-sm">{user.email}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === "group" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Selected users as chips */}
              {selectedUsers.length > 0 && (
                <div className="px-4 py-2 flex space-x-2 overflow-x-auto">
                  {selectedUsers.map(user => (
                    <div key={user.email} className="flex items-center bg-purple-600 rounded-full text-white py-1 px-3 whitespace-nowrap">
                      <span>{user.username || user.email}</span>
                      <button onClick={() => !isCreating && handleUserSelect(user)} className="ml-2 rounded-full p-0.5 hover:bg-purple-700">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 1: search */}
              {step === 1 && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="relative px-4 py-2">
                    <input type="text" ref={searchInputRef} placeholder="Search contacts..." className="w-full rounded-lg px-4 py-2 pl-10 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" value={searchQuery} onChange={handleSearchChange} disabled={isCreating} />
                    <svg className="absolute left-6 top-6 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
                    </svg>
                  </div>
                  <div className="flex-1 overflow-auto mt-2 px-4">
                    {isSearching && <div className="text-center text-gray-400 py-4">Searching...</div>}
                    {searchError && <div className="text-center text-red-400 py-4">{searchError}</div>}
                    {!isSearching && !searchError && searchResults.length === 0 && searchQuery.trim().length >= 3 && (
                      <div className="text-center text-gray-400 py-4">No results found</div>
                    )}
                    {searchResults.length > 0 && (
                      <div className="divide-y divide-gray-700">
                        {searchResults.map(user => {
                          const selected = selectedUsers.some(u => u.email === user.email);
                          return (
                            <div
                              key={user.email}
                              onClick={() =>
                                !isCreating && handleUserSelect(user)
                              }
                              className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-700 rounded ${
                                selected ? "bg-gray-700" : ""
                              }`}
                            >
                              <Avatar
                                src={user.avatar}
                                name={user.username || user.email}
                                size="sm"
                                status="offline"
                              />
                              <div className="ml-3 flex-grow">
                                <div className="text-white font-medium">
                                  {user.username || "User"}
                                </div>
                                <div className="text-gray-400 text-sm">
                                  {user.email}
                                </div>
                              </div>
                              <div
                                className={`w-5 h-5 flex-shrink-0 flex items-center justify-center border-2 rounded ${
                                  selected
                                    ? "bg-purple-600 border-purple-600"
                                    : "border-gray-500"
                                }`}
                              >
                                {selected && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: group details */}
              {step === 2 && (
                <div className="flex flex-col px-4 py-2 flex-1 overflow-auto">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-white mb-2">Group Name</label>
                    <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Enter group name..." className="w-full rounded-lg bg-gray-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" disabled={isCreating} />
                  </div>
                  <div className="flex-1 overflow-auto space-y-2">
                    {selectedUsers.map(user => (
                      <div key={user.email} className="flex items-center space-x-3">
                        <Avatar src={user.avatar} name={user.username || user.email} size="xs" />
                        <div>
                          <div className="text-white font-medium">{user.username || "User"}</div>
                          <div className="text-gray-400 text-xs">{user.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {searchError && (
                    <div className="mt-4 px-3 py-2 bg-red-700 bg-opacity-50 rounded text-red-300">{searchError}</div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-700 shrink-0">
          {mode === "group" && step === 2 && (
            <button onClick={() => setStep(1)} disabled={isCreating} className="text-gray-400 px-4 py-2 hover:text-white rounded">
              Back
            </button>
          )}
          <button onClick={handleClose} disabled={isCreating} className="text-gray-400 px-4 py-2 hover:text-white rounded">
            Cancel
          </button>
          {mode === "group" ? (
            <button
              onClick={handleCreateGroup}
              disabled={isCreating || (step === 1 ? selectedUsers.length === 0 : !groupName.trim())}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              {isCreating ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> : null}
              {step === 1 ? "Next" : "Create"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
