// chat/utils/chatHelpers.js

// Generate unique message ID
export function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate unique chat ID
export function generateChatId() {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get chat display name
export function getChatDisplayName(chat, currentUserId) {
  if (chat.type === "group") {
    return chat.name || "Group Chat";
  }

  // For direct chats, find the other participant
  const otherParticipant = chat.participants?.find(
    (p) => p.id !== currentUserId
  );
  return otherParticipant?.name || "Unknown User";
}

// Get chat avatar URL
export function getChatAvatarUrl(chat, currentUserId) {
  if (chat.type === "group") {
    return chat.avatar || "/default-group-avatar.png";
  }

  const otherParticipant = chat.participants?.find(
    (p) => p.id !== currentUserId
  );
  return otherParticipant?.avatar || "/default-avatar.png";
}

// Get online status for chat
export function getChatOnlineStatus(chat, currentUserId) {
  if (chat.type === "group") {
    const onlineCount =
      chat.participants?.filter(
        (p) => p.id !== currentUserId && p.status === "online"
      ).length || 0;
    return {
      status: onlineCount > 0 ? "online" : "offline",
      count: onlineCount,
    };
  }

  const otherParticipant = chat.participants?.find(
    (p) => p.id !== currentUserId
  );
  return {
    status: otherParticipant?.status || "offline",
    lastSeen: otherParticipant?.lastSeen,
  };
}

// Sort chats by activity (pinned first, then by last message time)
export function sortChatsByActivity(chats) {
  return [...chats].sort((a, b) => {
    // Pinned chats first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    // Then by last message timestamp
    const aTime = a.lastMessage?.timestamp
      ? new Date(a.lastMessage.timestamp)
      : new Date(0);
    const bTime = b.lastMessage?.timestamp
      ? new Date(b.lastMessage.timestamp)
      : new Date(0);

    return bTime - aTime;
  });
}

// Filter chats by search query
export function filterChatsBySearch(chats, query, currentUserId) {
  if (!query.trim()) return chats;

  const lowerQuery = query.toLowerCase();

  return chats.filter((chat) => {
    const displayName = getChatDisplayName(chat, currentUserId).toLowerCase();

    if (displayName.includes(lowerQuery)) return true;

    // Search in participants for group chats
    if (chat.type === "group") {
      return chat.participants?.some((participant) =>
        participant.name?.toLowerCase().includes(lowerQuery)
      );
    }

    // Search in last message content
    if (chat.lastMessage?.content?.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    return false;
  });
}

// Get unread count for all chats
export function getTotalUnreadCount(chats) {
  return chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
}

// Check if chat has unread messages
export function hasUnreadMessages(chat) {
  return (chat.unreadCount || 0) > 0;
}

// Get chat participants excluding current user
export function getOtherParticipants(chat, currentUserId) {
  return chat.participants?.filter((p) => p.id !== currentUserId) || [];
}

// Check if user is admin/owner of chat
export function isUserAdmin(chat, userId) {
  return chat.admins?.includes(userId) || chat.ownerId === userId;
}

// Check if user can perform action in chat
export function canUserPerformAction(chat, userId, action) {
  switch (action) {
    case "add_members":
    case "remove_members":
    case "edit_chat":
      return isUserAdmin(chat, userId);
    case "send_message":
      return chat.participants?.some((p) => p.id === userId);
    case "delete_chat":
      return chat.ownerId === userId;
    default:
      return false;
  }
}

// Generate chat room key for WebSocket subscriptions
export function getChatRoomKey(chatId) {
  return `/topic/chat/${chatId}`;
}

// Format typing indicator text
export function formatTypingIndicator(typingUsers) {
  if (!typingUsers || typingUsers.length === 0) return "";

  if (typingUsers.length === 1) {
    return `${typingUsers[0].name} is typing...`;
  } else if (typingUsers.length === 2) {
    return `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
  } else {
    return `${typingUsers[0].name} and ${
      typingUsers.length - 1
    } others are typing...`;
  }
}

// Create optimistic message for immediate UI update
export function createOptimisticMessage(messageData, currentUser) {
  return {
    id: generateMessageId(),
    content: messageData.content,
    type: messageData.type || "text",
    senderId: currentUser.id,
    sender: currentUser,
    timestamp: new Date().toISOString(),
    chatId: messageData.chatId,
    attachments: messageData.attachments || [],
    reactions: {},
    readBy: [currentUser.id],
    edited: false,
    optimistic: true, // Mark as optimistic for UI handling
  };
}

// Validate message content
export function validateMessageContent(content, type = "text") {
  if (!content && type === "text") {
    return { valid: false, error: "Message cannot be empty" };
  }

  if (content && content.length > 4000) {
    return { valid: false, error: "Message is too long (max 4000 characters)" };
  }

  return { valid: true };
}

// Extract and validate file attachments
export function validateFileAttachments(files) {
  const maxFileSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const errors = [];
  const validFiles = [];

  Array.from(files).forEach((file, index) => {
    if (file.size > maxFileSize) {
      errors.push(`File ${index + 1} is too large (max 50MB)`);
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File ${index + 1} type not supported`);
      return;
    }

    validFiles.push(file);
  });

  return { validFiles, errors };
}

// Debounce function for typing indicators
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll events
export function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Deep clone object (for state management)
export function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (typeof obj === "object") {
    const clonedObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}
