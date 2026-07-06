// chat/hooks/useReadReceipt.js
// Read receipts are handled server-side on WS subscribe (WebSocketEventListener).
// This hook sends WS events only — no REST calls needed.
import { useCallback } from "react";
import { useChatSocket } from "./useChatSocket";

export function useReadReceipt(chatId, currentUserId) {
  const { connected, sendMessage } = useChatSocket();

  const markAsRead = useCallback(
    (messageId) => {
      if (!chatId || !messageId || !currentUserId || !connected) return;
      sendMessage("/app/read-receipt", {
        chatId,
        messageId,
        userId: currentUserId,
        timestamp: new Date().toISOString(),
      });
    },
    [chatId, currentUserId, connected, sendMessage]
  );

  const markMultipleAsRead = useCallback(
    (messageIds) => {
      if (!chatId || !messageIds?.length || !currentUserId || !connected) return;
      messageIds.forEach((messageId) => {
        sendMessage("/app/read-receipt", {
          chatId,
          messageId,
          userId: currentUserId,
          timestamp: new Date().toISOString(),
        });
      });
    },
    [chatId, currentUserId, connected, sendMessage]
  );

  const setupReadReceiptObserver = useCallback(
    (messageElements) => {
      if (!messageElements?.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const messageId = entry.target.getAttribute("data-message-id");
              const senderId = entry.target.getAttribute("data-sender-id");
              if (messageId && senderId !== currentUserId) {
                markAsRead(messageId);
              }
            }
          });
        },
        { threshold: 0.5, rootMargin: "0px 0px -100px 0px" }
      );

      messageElements.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    },
    [currentUserId, markAsRead]
  );

  return { markAsRead, markMultipleAsRead, setupReadReceiptObserver };
}
