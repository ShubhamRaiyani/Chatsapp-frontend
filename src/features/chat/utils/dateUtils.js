// chat/utils/dateUtils.js
// Format time for message timestamps (e.g., "2:30 PM")
export function formatMessageTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Format time for chat list (e.g., "2:30 PM", "Yesterday", "Mon")
export function formatChatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // Less than 1 minute ago
  if (diffInMinutes < 1) {
    return "now";
  }

  // Less than 1 hour ago
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  // Today
  if (diffInHours < 24 && date.getDate() === now.getDate()) {
    return formatMessageTime(timestamp);
  }

  // Yesterday
  if (diffInDays === 1) {
    return "Yesterday";
  }

  // This week
  if (diffInDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }

  // This year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // Previous years
  return date.toLocaleDateString("en-US", {
    year: "2-digit",
    month: "short",
    day: "numeric",
  });
}

// Format full date and time
export function formatFullDateTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Format relative time (e.g., "2 hours ago", "3 days ago")
export function formatRelativeTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now - date;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  } else {
    return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
  }
}

// Check if timestamp is today
export function isToday(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Check if timestamp is yesterday
export function isYesterday(timestamp) {
  const date = new Date(timestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

// Check if timestamp is this week
export function isThisWeek(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  startOfWeek.setHours(0, 0, 0, 0);
  return date >= startOfWeek;
}

// Get start of day
export function getStartOfDay(date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

// Get end of day
export function getEndOfDay(date = new Date()) {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

// Format duration (e.g., for voice messages)
export function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// Parse timestamp from various formats
export function parseTimestamp(timestamp) {
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === "number") return new Date(timestamp);
  if (typeof timestamp === "string") return new Date(timestamp);
  return new Date();
}

// Format for different locales
export function formatForLocale(timestamp, locale = "en-US", options = {}) {
  const date = parseTimestamp(timestamp);
  return date.toLocaleString(locale, options);
}

// Get timezone offset
export function getTimezoneOffset() {
  return new Date().getTimezoneOffset();
}

// Convert to UTC
export function toUTC(timestamp) {
  const date = parseTimestamp(timestamp);
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}

// Convert from UTC
export function fromUTC(timestamp) {
  const date = parseTimestamp(timestamp);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
}

export function formatLastActivityChatCard(isoString) {
  const date = new Date(isoString); // Parses the ISO string

  // Example: Show "Yesterday", "Today", or full date
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else {
    // Show date in short form
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}

