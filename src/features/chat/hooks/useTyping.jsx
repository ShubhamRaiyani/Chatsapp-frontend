import { useCallback, useRef, useEffect } from "react";
import { useTypingContext } from "../context/TypingContext";
import { useChatSocket } from "./useChatSocket";
import webSocketService from "../services/WebSocketService";

export function useTyping(chatId, isGroup = false, currentUserId = null) {
  const { getTypingUsers, addTypingUser, removeTypingUser } = useTypingContext();
  const { connected, sendMessage } = useChatSocket();

  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const typingUsers = getTypingUsers(chatId);

  // Subscribe to incoming TYPING events from other users in this chat
  useEffect(() => {
    if (!chatId) return;
    const unsub = webSocketService.onTyping((event) => {
      const eventChatId = event.chatId || event.groupId;
      if (eventChatId !== chatId) return;
      if (event.userId === currentUserId) return; // ignore own echoed event

      if (event.isTyping) {
        addTypingUser(chatId, {
          id: event.userId,
          name: event.userName || event.userId,
        });
      } else {
        removeTypingUser(chatId, event.userId);
      }
    });
    return unsub;
  }, [chatId, currentUserId, addTypingUser, removeTypingUser]);

  const stopTyping = useCallback(
    (userId) => {
      if (!chatId || !connected || !isTypingRef.current) return;

      const payload = isGroup
        ? { type: "TYPING", groupId: chatId, userId, isTyping: false }
        : { type: "TYPING", chatId, userId, isTyping: false };
      sendMessage("/app/typing", payload);

      isTypingRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    },
    [chatId, isGroup, connected, sendMessage]
  );

  const startTyping = useCallback(
    (userId, userName) => {
      if (!chatId || !connected || isTypingRef.current) return;

      const payload = isGroup
        ? { type: "TYPING", groupId: chatId, userId, userName, isTyping: true }
        : { type: "TYPING", chatId, userId, userName, isTyping: true };
      sendMessage("/app/typing", payload);

      isTypingRef.current = true;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => stopTyping(userId), 3000);
    },
    [chatId, isGroup, connected, sendMessage, stopTyping]
  );

  // Cleanup on chat change
  useEffect(
    () => () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      isTypingRef.current = false;
    },
    [chatId]
  );

  return {
    typingUsers,
    startTyping,
    stopTyping,
    isTyping: isTypingRef.current,
  };
}
