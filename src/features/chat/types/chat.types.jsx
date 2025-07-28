// chat/types/chat.types.js

// Chat types enumeration
export const CHAT_TYPES = {
  DIRECT: "direct",
  GROUP: "group",
  CHANNEL: "channel",
};

// Message types enumeration
export const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  FILE: "file",
  VOICE: "voice",
  VIDEO: "video",
  SYSTEM: "system",
};

// User status enumeration
export const USER_STATUS = {
  ONLINE: "online",
  AWAY: "away",
  BUSY: "busy",
  OFFLINE: "offline",
};

// Message status enumeration
export const MESSAGE_STATUS = {
  SENDING: "sending",
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read",
  FAILED: "failed",
};

// Chat permissions
export const CHAT_PERMISSIONS = {
  SEND_MESSAGE: "send_message",
  ADD_MEMBERS: "add_members",
  REMOVE_MEMBERS: "remove_members",
  EDIT_CHAT: "edit_chat",
  DELETE_CHAT: "delete_chat",
  MANAGE_ADMINS: "manage_admins",
};

// Factory functions for creating objects

// Create a new chat object
export function createChat({
  id = null,
  name = "",
  type = CHAT_TYPES.DIRECT,
  participants = [],
  avatar = null,
  description = "",
  ownerId = null,
  admins = [],
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
  lastMessage = null,
  unreadCount = 0,
  pinned = false,
  muted = false,
  archived = false,
} = {}) {
  return {
    id,
    name,
    type,
    participants,
    avatar,
    description,
    ownerId,
    admins,
    createdAt,
    updatedAt,
    lastMessage,
    unreadCount,
    pinned,
    muted,
    archived,
  };
}

// Create a new message object
export function createMessage({
  id = null,
  content = "",
  type = MESSAGE_TYPES.TEXT,
  senderId = null,
  sender = null,
  chatId = null,
  timestamp = new Date().toISOString(),
  attachments = [],
  reactions = {},
  readBy = [],
  edited = false,
  editedAt = null,
  replyTo = null,
  status = MESSAGE_STATUS.SENDING,
} = {}) {
  return {
    id,
    content,
    type,
    senderId,
    sender,
    chatId,
    timestamp,
    attachments,
    reactions,
    readBy,
    edited,
    editedAt,
    replyTo,
    status,
  };
}

// Create a new user object
export function createUser({
  id = null,
  name = "",
  email = "",
  avatar = null,
  status = USER_STATUS.OFFLINE,
  lastSeen = null,
  bio = "",
  phoneNumber = "",
  preferences = {},
} = {}) {
  return {
    id,
    name,
    email,
    avatar,
    status,
    lastSeen,
    bio,
    phoneNumber,
    preferences,
  };
}

// Create a new attachment object
export function createAttachment({
  id = null,
  url = "",
  name = "",
  size = 0,
  type = "",
  thumbnailUrl = null,
  duration = null, // for audio/video files
  width = null, // for images/videos
  height = null, // for images/videos
} = {}) {
  return {
    id,
    url,
    name,
    size,
    type,
    thumbnailUrl,
    duration,
    width,
    height,
  };
}

// Create a new reaction object
export function createReaction({ emoji = "", users = [], count = 0 } = {}) {
  return {
    emoji,
    users,
    count,
  };
}

// Create typing user object
export function createTypingUser({ id = null, name = "", avatar = null } = {}) {
  return {
    id,
    name,
    avatar,
  };
}

// Create notification object
export function createNotification({
  id = null,
  type = "",
  title = "",
  message = "",
  data = {},
  read = false,
  timestamp = new Date().toISOString(),
} = {}) {
  return {
    id,
    type,
    title,
    message,
    data,
    read,
    timestamp,
  };
}

// Validation functions

// Validate chat object
export function validateChat(chat) {
  const errors = [];

  if (!chat.id) errors.push("Chat ID is required");
  if (!Object.values(CHAT_TYPES).includes(chat.type)) {
    errors.push("Invalid chat type");
  }
  if (!Array.isArray(chat.participants)) {
    errors.push("Participants must be an array");
  }
  if (chat.type === CHAT_TYPES.GROUP && !chat.name) {
    errors.push("Group chats must have a name");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate message object
export function validateMessage(message) {
  const errors = [];

  if (!message.id) errors.push("Message ID is required");
  if (!message.senderId) errors.push("Sender ID is required");
  if (!message.chatId) errors.push("Chat ID is required");
  if (!Object.values(MESSAGE_TYPES).includes(message.type)) {
    errors.push("Invalid message type");
  }
  if (message.type === MESSAGE_TYPES.TEXT && !message.content) {
    errors.push("Text messages must have content");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate user object
export function validateUser(user) {
  const errors = [];

  if (!user.id) errors.push("User ID is required");
  if (!user.name) errors.push("User name is required");
  if (!user.email) errors.push("User email is required");
  if (!Object.values(USER_STATUS).includes(user.status)) {
    errors.push("Invalid user status");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
