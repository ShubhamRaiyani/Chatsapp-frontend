// chat/components/NewChatModal.jsx - FIXED: Direct chat creation issue
import React, { useState, useEffect, useRef } from "react";
import Avatar from "./ui/Avatar";
import UserAPI from "../services/UserAPI";

const NewChatModal = ({
  isOpen,
  onClose,
  onCreateChat,
  onCreateGroup,
  activeSection,
  className = "",
}) => {
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

  const isGroupMode = activeSection === "groups";

  // Real API search function with minimum 3 characters
  const searchUsers = async (query) => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 3) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const users = await UserAPI.searchUsers(trimmedQuery);
      setSearchResults(users || []);

      if (users.length === 0) {
        setSearchError("No users found matching your search");
      }
    } catch (error) {
      console.error("Search failed:", error);
      setSearchError("Failed to search users. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Clear results immediately if less than 3 characters
    if (query.trim().length < 3) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    // Set new debounce for API call
    debounceRef.current = setTimeout(() => {
      searchUsers(query);
    }, 500);
  };

  // ✅ FIXED: Handle user selection - direct chat creation bug
  const handleUserSelect = (user) => {
    if (isGroupMode) {
      // For groups, allow multiple selection
      if (selectedUsers.find((u) => u.email === user.email)) {
        setSelectedUsers(selectedUsers.filter((u) => u.email !== user.email));
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    } else {
      // ✅ FIX: For direct chat, create immediately with the user's EMAIL
      handleCreateDirectChat(user); // Pass single user object, not array
    }
  };

  // ✅ FIXED: Handle direct chat creation - was expecting array, now handles single user
  const handleCreateDirectChat = async (user) => {
    if (!user || isCreating) return;

    setIsCreating(true);
    try {
      console.log("NewChatModal: Creating direct chat with email:", user.email);
      // ✅ FIX: Pass user.email directly, not wrapped in array
      await onCreateChat(user.email);
      handleClose();
    } catch (error) {
      console.error("Failed to create direct chat:", error);
      setSearchError("Failed to create chat. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle group creation
  const handleCreateGroup = async () => {
    if (selectedUsers.length === 0 || isCreating) return;

    if (step === 1 && selectedUsers.length > 0) {
      setStep(2);
    } else if (step === 2) {
      setIsCreating(true);
      try {
        const memberEmails = selectedUsers.map((user) => user.email);
        const name = groupName.trim() || "New Group";

        console.log(
          "NewChatModal: Creating group:",
          name,
          "with members:",
          memberEmails
        );
        await onCreateGroup(name, memberEmails);
        handleClose();
      } catch (error) {
        console.error("Failed to create group:", error);
        setSearchError("Failed to create group. Please try again.");
      } finally {
        setIsCreating(false);
      }
    }
  };

  // Reset modal state
  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUsers([]);
    setGroupName("");
    setStep(1);
    setSearchError(null);
    setIsCreating(false);
    onClose();
  };

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const canProceed = isGroupMode
    ? step === 1
      ? selectedUsers.length > 0
      : groupName.trim().length > 0
    : selectedUsers.length === 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            {isGroupMode
              ? step === 1
                ? "Create Group"
                : "Group Details"
              : "New Chat"}
          </h2>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {step === 1 && (
            <>
              {/* Search Input */}
              <div className="p-4 border-b border-gray-700">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search by email (min 3 characters)..."
                    className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isCreating}
                  />
                  <svg
                    className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* Search hint */}
                {searchQuery.length > 0 && searchQuery.length < 3 && (
                  <p className="text-xs text-yellow-400 mt-2">
                    Type at least 3 characters to search
                  </p>
                )}
              </div>

              {/* Selected Users (for groups) */}
              {isGroupMode && selectedUsers.length > 0 && (
                <div className="p-4 border-b border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.email}
                        className="flex items-center bg-purple-600 text-white px-3 py-1 rounded-full text-sm"
                      >
                        <span>{user.username || user.email}</span>
                        <button
                          onClick={() => handleUserSelect(user)}
                          disabled={isCreating}
                          className="ml-2 hover:bg-purple-700 rounded-full p-0.5 disabled:opacity-50"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto">
                {isSearching && (
                  <div className="p-4 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    Searching...
                  </div>
                )}

                {searchError && (
                  <div className="p-4 text-center text-red-400">
                    {searchError}
                  </div>
                )}

                {!isSearching &&
                  !searchError &&
                  searchQuery.length >= 3 &&
                  searchResults.length === 0 && (
                    <div className="p-4 text-center text-gray-400">
                      No users found
                    </div>
                  )}

                {!isSearching && searchResults.length > 0 && (
                  <div className="divide-y divide-gray-700">
                    {searchResults.map((user) => {
                      const isSelected = selectedUsers.find(
                        (u) => u.email === user.email
                      );
                      return (
                        <div
                          key={user.email}
                          onClick={() => !isCreating && handleUserSelect(user)}
                          className={`p-4 flex items-center space-x-3 hover:bg-gray-700 cursor-pointer transition-colors ${
                            isSelected ? "bg-gray-700" : ""
                          } ${
                            isCreating ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <Avatar
                            src={user.avatar}
                            name={user.username || user.email}
                            size="sm"
                            status="offline"
                          />
                          <div className="flex-1">
                            <div className="text-white font-medium">
                              {user.username || "User"}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {user.email}
                            </div>
                          </div>
                          {isGroupMode && (
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected
                                  ? "bg-purple-600 border-purple-600"
                                  : "border-gray-500"
                              }`}
                            >
                              {isSelected && (
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
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Group Details Step */}
          {step === 2 && isGroupMode && (
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Group Name*
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isCreating}
                />
              </div>

              <div className="mb-4">
                <div className="text-sm font-medium text-gray-300 mb-2">
                  Members ({selectedUsers.length})
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.email}
                      className="flex items-center space-x-3"
                    >
                      <Avatar
                        src={user.avatar}
                        name={user.username || user.email}
                        size="xs"
                      />
                      <div>
                        <span className="text-white text-sm">
                          {user.username || "User"}
                        </span>
                        <div className="text-xs text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {searchError && (
                <div className="mb-4 p-3 bg-red-600 bg-opacity-20 border border-red-600 rounded-lg">
                  <p className="text-red-400 text-sm">{searchError}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end space-x-3">
          {step === 2 && isGroupMode && (
            <button
              onClick={() => setStep(1)}
              disabled={isCreating}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Back
            </button>
          )}
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          {isGroupMode && (
            <button
              onClick={handleCreateGroup}
              disabled={!canProceed || isCreating}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isCreating && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {step === 1
                ? "Next"
                : isCreating
                ? "Creating..."
                : "Create Group"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
