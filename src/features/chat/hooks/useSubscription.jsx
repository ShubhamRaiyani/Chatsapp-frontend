// chat/hooks/useSubscription.js
import { useEffect, useCallback, useState } from "react";
import { useSubscriptionContext  } from "../context/SubscriptionContext";
import { useChatSocket } from "./useChatSocket";

export function useSubscription(chatId) {
  const { subscribe, unsubscribe, isSubscribed } = useSubscriptionContext();
  const [subscriptionState, setSubscriptionState] = useState("idle"); // idle, subscribing, subscribed, error

  const { connected, sendMessage } = useChatSocket();

  // Subscribe to chat
  const subscribeToChat = useCallback(async () => {
    if (!chatId || isSubscribed(chatId)) return;  

    try {
      setSubscriptionState("subscribing");

      await subscribe(chatId, {
        onMessage: (message) => {
          // Handle incoming messages
          console.log("Received message:", message);
        },
        onUserJoin: (user) => {
          console.log("User joined:", user);
        },
        onUserLeave: (user) => {
          console.log("User left:", user);
        },
        onTyping: (data) => {
          console.log("Typing update:", data);
        },
      });

      setSubscriptionState("subscribed");
    } catch (error) {
      console.error("Failed to subscribe to chat:", error);
      setSubscriptionState("error");
    }
  }, [chatId, subscribe, isSubscribed]);

  // Unsubscribe from chat
  const unsubscribeFromChat = useCallback(async () => {
    if (!chatId || !isSubscribed(chatId)) return;

    try {
      await unsubscribe(chatId);
      setSubscriptionState("idle");
    } catch (error) {
      console.error("Failed to unsubscribe from chat:", error);
    }
  }, [chatId, unsubscribe, isSubscribed]);

  // Join chat room (send join event)
  const joinRoom = useCallback(() => {
    if (connected && chatId) {
      sendMessage("/app/chat.join", {
        chatId,
        type: "JOIN",
      });
    }
  }, [connected, chatId, sendMessage]);

  // Leave chat room (send leave event)
  const leaveRoom = useCallback(() => {
    if (connected && chatId) {
      sendMessage("/app/chat.leave", {
        chatId,
        type: "LEAVE",
      });
    }
  }, [connected, chatId, sendMessage]);

  // Auto-subscribe when chat changes and connected
  useEffect(() => {
    if (chatId && connected) {
      subscribeToChat();
      joinRoom();
    }

    return () => {
      if (chatId && connected) {
        leaveRoom();
        unsubscribeFromChat();
      }
    };
  }, [
    chatId,
    connected,
    subscribeToChat,
    unsubscribeFromChat,
    joinRoom,
    leaveRoom,
  ]);

  return {
    subscriptionState,
    isSubscribed: isSubscribed(chatId),
    subscribeToChat,
    unsubscribeFromChat,
    joinRoom,
    leaveRoom,
  };
}
