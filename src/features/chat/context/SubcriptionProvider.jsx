import React, { useState, useEffect, useCallback } from "react";
import SubscriptionContext from "./SubscriptionContext";
import SubscriptionManager from "../services/SubscriptionManager";

export function SubscriptionProvider({ children }) {
  const [subscriptions, setSubscriptions] = useState(new Set());
  const [subscriptionManager] = useState(() => new SubscriptionManager());

  const subscribe = useCallback(
    async (chatId, callbacks = {}) => {
      try {
        await subscriptionManager.subscribe(chatId, callbacks);
        setSubscriptions((prev) => new Set([...prev, chatId]));
      } catch (error) {
        console.error("Failed to subscribe to chat:", chatId, error);
      }
    },
    [subscriptionManager]
  );

  const unsubscribe = useCallback(
    async (chatId) => {
      try {
        await subscriptionManager.unsubscribe(chatId);
        setSubscriptions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(chatId);
          return newSet;
        });
      } catch (error) {
        console.error("Failed to unsubscribe from chat:", chatId, error);
      }
    },
    [subscriptionManager]
  );

  const isSubscribed = useCallback(
    (chatId) => {
      return subscriptions.has(chatId);
    },
    [subscriptions]
  );

  useEffect(() => {
    return () => {
      subscriptionManager.cleanup();
    };
  }, [subscriptionManager]);

  const value = {
    subscriptions: Array.from(subscriptions),
    subscribe,
    unsubscribe,
    isSubscribed,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
