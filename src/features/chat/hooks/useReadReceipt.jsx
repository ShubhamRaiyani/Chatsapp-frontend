// chat/hooks/useReadReceipt.js
import { useCallback, useEffect } from "react";
import { useChatSocket } from "./useChatSocket";
import ChatAPI from "../services/ChatAPI";

export function useReadReceipt(chatId, currentUserId) {
  const { connected, sendMessage } = useChatSocket();

  // Mark message as read
  const markAsRead = useCallback(
    async (messageId) => {
      if (!chatId || !messageId || !currentUserId) return;

      try {
        // Update server
        await ChatAPI.markMessageAsRead(chatId, messageId, currentUserId);

        // Send read receipt via WebSocket
        if (connected) {
          sendMessage("/app/read-receipt", {
            chatId,
            messageId,
            userId: currentUserId,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Failed to mark message as read:", error);
      }
    },
    [chatId, currentUserId, connected, sendMessage]
  );

  // Mark multiple messages as read
  const markMultipleAsRead = useCallback(
    async (messageIds) => {
      if (!chatId || !messageIds?.length || !currentUserId) return;

      try {
        // Update server
        await ChatAPI.markMessagesAsRead(chatId, messageIds, currentUserId);

        // Send read receipts via WebSocket
        if (connected) {
          messageIds.forEach((messageId) => {
            sendMessage("/app/read-receipt", {
              chatId,
              messageId,
              userId: currentUserId,
              timestamp: new Date().toISOString(),
            });
          });
        }
      } catch (error) {
        console.error("Failed to mark messages as read:", error);
      }
    },
    [chatId, currentUserId, connected, sendMessage]
  );

  // Auto-mark visible messages as read (intersection observer)
  const setupReadReceiptObserver = useCallback(
    (messageElements) => {
      if (!messageElements?.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const messageId = entry.target.getAttribute("data-message-id");
              const senderId = entry.target.getAttribute("data-sender-id");

              // Only mark as read if not sent by current user
              if (messageId && senderId !== currentUserId) {
                markAsRead(messageId);
              }
            }
          });
        },
        {
          threshold: 0.5, // Message must be 50% visible
          rootMargin: "0px 0px -100px 0px", // Only consider messages not too close to bottom
        }
      );

      messageElements.forEach((element) => {
        observer.observe(element);
      });

      return () => {
        observer.disconnect();
      };
    },
    [currentUserId, markAsRead]
  );

  // Handle read receipt events from server
  const handleReadReceiptEvent = useCallback(
    (message) => {
      const {
        chatId: eventChatId,
        messageId,
        userId,
        timestamp,
      } = JSON.parse(message.body);

      if (eventChatId === chatId) {
        // This would typically update the message state to show read receipt
        console.log(
          `Message ${messageId} read by user ${userId} at ${timestamp}`
        );
      }
    },
    [chatId]
  );

  return {
    markAsRead,
    markMultipleAsRead,
    setupReadReceiptObserver,
  };
}
