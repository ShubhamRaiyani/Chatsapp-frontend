// chat/types/websocket.types.js

// WebSocket connection states
export const CONNECTION_STATES = {
  CONNECTING: "connecting",
  CONNECTED: "connected",
  DISCONNECTING: "disconnecting",
  DISCONNECTED: "disconnected",
  RECONNECTING: "reconnecting",
  ERROR: "error",
};

// WebSocket message types
export const WS_MESSAGE_TYPES = {
  // Chat messages
  MESSAGE: "MESSAGE",
  MESSAGE_EDIT: "MESSAGE_EDIT",
  MESSAGE_DELETE: "MESSAGE_DELETE",
  MESSAGE_REACTION: "MESSAGE_REACTION",

  // Typing indicators
  TYPING_START: "TYPING_START",
  TYPING_STOP: "TYPING_STOP",

  // User presence
  USER_ONLINE: "USER_ONLINE",
  USER_OFFLINE: "USER_OFFLINE",
  USER_STATUS_CHANGE: "USER_STATUS_CHANGE",

  // Chat events
  CHAT_JOIN: "CHAT_JOIN",
  CHAT_LEAVE: "CHAT_LEAVE",
  CHAT_UPDATE: "CHAT_UPDATE",

  // Read receipts
  MESSAGE_READ: "MESSAGE_READ",

  // Notifications
  NOTIFICATION: "NOTIFICATION",

  // System events
  CONNECTION_ACK: "CONNECTION_ACK",
  HEARTBEAT: "HEARTBEAT",
  ERROR: "ERROR",
};

// WebSocket destinations/endpoints
export const WS_DESTINATIONS = {
  // Outgoing (client to server)
  SEND_MESSAGE: "/app/chat.sendMessage",
  EDIT_MESSAGE: "/app/chat.editMessage",
  DELETE_MESSAGE: "/app/chat.deleteMessage",
  REACT_TO_MESSAGE: "/app/chat.reactToMessage",
  TYPING: "/app/chat.typing",
  JOIN_CHAT: "/app/chat.join",
  LEAVE_CHAT: "/app/chat.leave",
  UPDATE_STATUS: "/app/user.updateStatus",
  MARK_READ: "/app/chat.markRead",

  // Incoming (server to client)
  USER_MESSAGES: "/user/queue/messages",
  USER_TYPING: "/user/queue/typing",
  USER_PRESENCE: "/user/queue/presence",
  USER_NOTIFICATIONS: "/user/queue/notifications",

  // Topic subscriptions
  CHAT_MESSAGES: (chatId) => `/topic/chat/${chatId}/messages`,
  CHAT_TYPING: (chatId) => `/topic/chat/${chatId}/typing`,
  CHAT_EVENTS: (chatId) => `/topic/chat/${chatId}/events`,
  USER_PRESENCE_TOPIC: "/topic/presence",
};

// WebSocket event payload factories

// Create message event payload
export function createMessageEvent({
  type = WS_MESSAGE_TYPES.MESSAGE,
  chatId = null,
  messageId = null,
  content = "",
  senderId = null,
  timestamp = new Date().toISOString(),
  attachments = [],
  replyTo = null,
} = {}) {
  return {
    type,
    chatId,
    messageId,
    content,
    senderId,
    timestamp,
    attachments,
    replyTo,
  };
}

// Create typing event payload
export function createTypingEvent({
  chatId = null,
  userId = null,
  userName = "",
  isTyping = false,
  timestamp = new Date().toISOString(),
} = {}) {
  return {
    type: isTyping
      ? WS_MESSAGE_TYPES.TYPING_START
      : WS_MESSAGE_TYPES.TYPING_STOP,
    chatId,
    userId,
    userName,
    isTyping,
    timestamp,
  };
}

// Create presence event payload
export function createPresenceEvent({
  userId = null,
  status = "offline",
  lastSeen = null,
  timestamp = new Date().toISOString(),
} = {}) {
  return {
    type: WS_MESSAGE_TYPES.USER_STATUS_CHANGE,
    userId,
    status,
    lastSeen,
    timestamp,
  };
}

// Create chat event payload
export function createChatEvent({
  type = WS_MESSAGE_TYPES.CHAT_JOIN,
  chatId = null,
  userId = null,
  user = null,
  timestamp = new Date().toISOString(),
} = {}) {
  return {
    type,
    chatId,
    userId,
    user,
    timestamp,
  };
}

// Create reaction event payload
export function createReactionEvent({
  chatId = null,
  messageId = null,
  userId = null,
  emoji = "",
  action = "add", // 'add' or 'remove'
  timestamp = new Date().toISOString(),
} = {}) {
  return {
    type: WS_MESSAGE_TYPES.MESSAGE_REACTION,
    chatId,
    messageId,
    userId,
    emoji,
    action,
    timestamp,
  };
}

// Create read receipt event payload
export function createReadReceiptEvent({
  chatId = null,
  messageId = null,
  userId = null,
  timestamp = new Date().toISOString(),
} = {}) {
  return {
    type: WS_MESSAGE_TYPES.MESSAGE_READ,
    chatId,
    messageId,
    userId,
    timestamp,
  };
}

// Create notification event payload
export function createNotificationEvent({
  id = null,
  type = "",
  title = "",
  message = "",
  data = {},
  timestamp = new Date().toISOString(),
} = {}) {
  return {
    type: WS_MESSAGE_TYPES.NOTIFICATION,
    id,
    notificationType: type,
    title,
    message,
    data,
    timestamp,
  };
}

// WebSocket error types
export const WS_ERROR_TYPES = {
  CONNECTION_FAILED: "connection_failed",
  AUTHENTICATION_FAILED: "authentication_failed",
  SUBSCRIPTION_FAILED: "subscription_failed",
  MESSAGE_SEND_FAILED: "message_send_failed",
  HEARTBEAT_TIMEOUT: "heartbeat_timeout",
  UNKNOWN_ERROR: "unknown_error",
};

// Create error event payload
export function createErrorEvent({
  type = WS_ERROR_TYPES.UNKNOWN_ERROR,
  message = "",
  code = null,
  details = {},
  timestamp = new Date().toISOString(),
} = {}) {
  return {
    type: WS_MESSAGE_TYPES.ERROR,
    errorType: type,
    message,
    code,
    details,
    timestamp,
  };
}

// WebSocket configuration defaults
export const WS_CONFIG = {
  HEARTBEAT_INCOMING: 4000,
  HEARTBEAT_OUTGOING: 4000,
  RECONNECT_DELAY: 1000,
  MAX_RECONNECT_ATTEMPTS: 5,
  CONNECTION_TIMEOUT: 10000,
  SUBSCRIPTION_TIMEOUT: 5000,
};

// Validation functions for WebSocket payloads

// Validate message event
export function validateMessageEvent(event) {
  const errors = [];

  if (!event.type || !Object.values(WS_MESSAGE_TYPES).includes(event.type)) {
    errors.push("Invalid or missing event type");
  }
  if (!event.chatId) errors.push("Chat ID is required");
  if (!event.senderId) errors.push("Sender ID is required");

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate typing event
export function validateTypingEvent(event) {
  const errors = [];

  if (!event.chatId) errors.push("Chat ID is required");
  if (!event.userId) errors.push("User ID is required");
  if (typeof event.isTyping !== "boolean") {
    errors.push("isTyping must be a boolean");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Parse incoming WebSocket message
export function parseWSMessage(message) {
  try {
    const parsed = JSON.parse(message.body || message);
    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to parse WebSocket message - " + error.message,
      raw: message,
    };
  }
}
