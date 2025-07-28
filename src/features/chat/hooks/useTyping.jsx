import { useCallback, useRef, useEffect } from "react";
import { useTypingContext } from "../context/TypingContext";
import { useChatSocket } from "./useChatSocket";

export function useTyping(chatId) {
  const { getTypingUsers, addTypingUser, removeTypingUser } =
    useTypingContext();
  const { connected, sendMessage } = useChatSocket();

  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  /* ---------- derived data ---------- */
  const typingUsers = getTypingUsers(chatId);

  /* ---------- commands ---------- */
  const stopTyping = useCallback(
    (userId) => {
      if (!chatId || !connected || !isTypingRef.current) return;

      removeTypingUser(chatId, userId);
      sendMessage("/app/typing", { chatId, userId, isTyping: false });

      isTypingRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    },
    [chatId, connected, removeTypingUser, sendMessage]
  );

  const startTyping = useCallback(
    (userId, userName) => {
      if (!chatId || !connected || isTypingRef.current) return;

      addTypingUser(chatId, { id: userId, name: userName });
      sendMessage("/app/typing", { chatId, userId, userName, isTyping: true });

      isTypingRef.current = true;

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => stopTyping(userId), 3000);
    },
    [chatId, connected, addTypingUser, sendMessage, stopTyping]
  );

  /* ---------- cleanup ---------- */
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
