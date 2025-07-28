import React, { useState, useRef, useCallback } from "react";
import TypingContext from "./TypingContext";

export function TypingProvider({ children }) {
  const [typingUsers, setTypingUsers] = useState({});
  const timeouts = useRef({});

  /* ---------- helpers ---------- */
  const removeTypingUser = useCallback((chatId, userId) => {
    setTypingUsers((prev) => {
      const chatTyping = prev[chatId] ?? [];
      const updated = chatTyping.filter((u) => u.id !== userId);

      if (updated.length === 0) {
        const { [chatId]: _discard, ...rest } = prev;
        return rest;
      }
      return { ...prev, [chatId]: updated };
    });

    const key = `${chatId}-${userId}`;
    if (timeouts.current[key]) {
      clearTimeout(timeouts.current[key]);
      delete timeouts.current[key];
    }
  }, []);

  const addTypingUser = useCallback(
    (chatId, user) => {
      setTypingUsers((prev) => {
        const chatTyping = prev[chatId] ?? [];
        if (chatTyping.find((u) => u.id === user.id)) return prev;
        return { ...prev, [chatId]: [...chatTyping, user] };
      });

      const key = `${chatId}-${user.id}`;
      if (timeouts.current[key]) clearTimeout(timeouts.current[key]);

      timeouts.current[key] = setTimeout(() => {
        removeTypingUser(chatId, user.id);
      }, 3000);
    },
    [removeTypingUser]
  );

  const getTypingUsers = useCallback(
    (chatId) => typingUsers[chatId] ?? [],
    [typingUsers]
  );

  const clearTypingUsers = useCallback((chatId) => {
    setTypingUsers((prev) => {
      const { [chatId]: _removed, ...rest } = prev;
      return rest;
    });

    Object.keys(timeouts.current).forEach((key) => {
      if (key.startsWith(`${chatId}-`)) {
        clearTimeout(timeouts.current[key]);
        delete timeouts.current[key];
      }
    });
  }, []);

  const value = {
    typingUsers,
    addTypingUser,
    removeTypingUser,
    getTypingUsers,
    clearTypingUsers,
  };

  return (
    <TypingContext.Provider value={value}>{children}</TypingContext.Provider>
  );
}
