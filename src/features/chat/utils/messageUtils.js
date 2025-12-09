// chat/utils/messageUtils.js

// Group messages by date
export function groupMessagesByDate(messages) {
  const groups = [];
  let currentGroup = null;

  messages.forEach((message) => {
    const messageDate = new Date(message.sentAt);
    const dateString = formatDateForGrouping(messageDate);

    if (!currentGroup || currentGroup.date !== dateString) {
      currentGroup = {
        date: dateString,
        messages: [],
      };
      groups.push(currentGroup);
    }

    currentGroup.messages.push(message);
  });

  return groups;
}

// Format date for message grouping
function formatDateForGrouping(date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) {
    return "Today";
  } else if (isSameDay(date, yesterday)) {
    return "Yesterday";
  } else if (date.getFullYear() === today.getFullYear()) {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  } else {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

// Check if two dates are the same day
function isSameDay(date1, date2) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

// Determine if avatar should be shown for a message
export function shouldShowAvatar(message, prevMessage, nextMessage, isOwn) {
  if (isOwn) return false; // Never show avatar for own messages

  // Always show avatar for first message
  if (!prevMessage) return true;

  // Show avatar if sender changed
  if (prevMessage.senderId !== message.senderId) return true;

  // Show avatar if there's a time gap (more than 5 minutes)
  const prevTime = new Date(prevMessage.timestamp);
  const currentTime = new Date(message.timestamp);
  const timeDiff = currentTime - prevTime;
  if (timeDiff > 5 * 60 * 1000) return true; // 5 minutes

  // Show avatar if this is the last message from this sender
  if (!nextMessage || nextMessage.senderId !== message.senderId) return true;

  return false;
}

// Format message content for display
export function formatMessageContent(message) {
  if (!message.content) return "";

  let content = message.content;

  // Convert URLs to links
  content = content.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>'
  );

  // Convert mentions (@username) to styled spans
  content = content.replace(
    /@([a-zA-Z0-9_]+)/g,
    '<span class="bg-blue-100 text-blue-800 px-1 rounded">@$1</span>'
  );

  // Convert basic markdown-style formatting
  content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"); // Bold
  content = content.replace(/\*(.*?)\*/g, "<em>$1</em>"); // Italic
  content = content.replace(
    /`(.*?)`/g,
    '<code class="bg-gray-100 px-1 rounded">$1</code>'
  ); // Code

  return content;
}

// Extract mentions from message content
export function extractMentions(content) {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const mentions = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
}

// Extract URLs from message content
export function extractUrls(content) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = [];
  let match;

  while ((match = urlRegex.exec(content)) !== null) {
    urls.push(match[1]);
  }

  return urls;
}

// Check if message contains media
export function hasMedia(message) {
  return message.attachments && message.attachments.length > 0;
}

// Get media type from message
export function getMediaType(message) {
  if (!hasMedia(message)) return null;

  const attachment = message.attachments[0];
  if (attachment.type.startsWith("image/")) return "image";
  if (attachment.type.startsWith("video/")) return "video";
  if (attachment.type.startsWith("audio/")) return "audio";
  return "file";
}

// Format file size
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Truncate text with ellipsis
export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

// Check if message is a system message
export function isSystemMessage(message) {
  return message.type === "system";
}

// Check if message is from current user
export function isOwnMessage(message, currentUserId) {
  return message.senderId === currentUserId;
}

// Sort messages by timestamp
export function sortMessagesByTime(messages, ascending = true) {
  return [...messages].sort((a, b) => {
    const timeA = new Date(a.timestamp);
    const timeB = new Date(b.timestamp);
    return ascending ? timeA - timeB : timeB - timeA;
  });
}

// Filter messages by type
export function filterMessagesByType(messages, type) {
  return messages.filter((message) => message.type === type);
}

// Search messages by content
export function searchMessages(messages, query) {
  const lowerQuery = query.toLowerCase();
  return messages.filter(
    (message) =>
      message.content?.toLowerCase().includes(lowerQuery) ||
      message.sender?.name?.toLowerCase().includes(lowerQuery)
  );
}

// Get message reactions summary
export function getReactionsSummary(reactions) {
  if (!reactions || typeof reactions !== "object") return [];

  return Object.entries(reactions).map(([emoji, users]) => ({
    emoji,
    count: Array.isArray(users) ? users.length : 0,
    users: Array.isArray(users) ? users : [],
  }));
}

// Check if user has reacted to message
export function hasUserReacted(message, userId, emoji = null) {
  if (!message.reactions) return false;

  if (emoji) {
    return message.reactions[emoji]?.includes(userId) || false;
  }

  // Check if user has any reaction
  return Object.values(message.reactions).some(
    (users) => Array.isArray(users) && users.includes(userId)
  );
}
