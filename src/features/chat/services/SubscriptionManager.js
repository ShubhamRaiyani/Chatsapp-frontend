// chat/services/SubscriptionManager.js

import webSocketService from "./WebSocketService"; // Import the singleton instance

class SubscriptionManager {
  constructor() {
    this.subscriptions = new Map();
    this.wsService = webSocketService; // ✅ Use the singleton instance directly
  }

  // Subscribe to a chat room
  async subscribe(chatId, callbacks = {}) {
    if (this.subscriptions.has(chatId)) {
      console.warn(`Already subscribed to chat ${chatId}`);
      return;
    }

    try {
      const subscriptionHandlers = {
        messages: null,
        typing: null,
        presence: null,
        notifications: null,
      };

      // Subscribe to different channels for this chat
      if (callbacks.onMessage) {
        subscriptionHandlers.messages = this.wsService.subscribe(
          `/topic/chat/${chatId}/messages`,
          callbacks.onMessage
        );
      }

      if (callbacks.onTyping) {
        subscriptionHandlers.typing = this.wsService.subscribe(
          `/topic/chat/${chatId}/typing`,
          callbacks.onTyping
        );
      }

      if (
        callbacks.onPresence ||
        callbacks.onUserJoin ||
        callbacks.onUserLeave
      ) {
        subscriptionHandlers.presence = this.wsService.subscribe(
          `/topic/chat/${chatId}/presence`,
          (message) => {
            const data = JSON.parse(message.body);
            switch (data.type) {
              case "USER_JOIN":
                callbacks.onUserJoin?.(data.user);
                break;
              case "USER_LEAVE":
                callbacks.onUserLeave?.(data.user);
                break;
              case "PRESENCE_UPDATE":
                callbacks.onPresence?.(data);
                break;
            }
          }
        );
      }

      if (callbacks.onNotification) {
        subscriptionHandlers.notifications = this.wsService.subscribe(
          `/user/queue/chat/${chatId}/notifications`,
          callbacks.onNotification
        );
      }

      // Store subscription info
      this.subscriptions.set(chatId, {
        handlers: subscriptionHandlers,
        callbacks,
        createdAt: new Date(),
      });

      console.log(`Subscribed to chat ${chatId}`);
    } catch (error) {
      console.error(`Failed to subscribe to chat ${chatId}:`, error);
      throw error;
    }
  }

  // Unsubscribe from a chat room
  async unsubscribe(chatId) {
    const subscription = this.subscriptions.get(chatId);
    if (!subscription) {
      console.warn(`Not subscribed to chat ${chatId}`);
      return;
    }

    try {
      // Unsubscribe from all handlers
      Object.values(subscription.handlers).forEach((handler) => {
        if (handler && typeof handler.unsubscribe === "function") {
          handler.unsubscribe();
        }
      });

      // Remove from our tracking
      this.subscriptions.delete(chatId);
      console.log(`Unsubscribed from chat ${chatId}`);
    } catch (error) {
      console.error(`Failed to unsubscribe from chat ${chatId}:`, error);
      throw error;
    }
  }

  // Check if subscribed to a chat
  isSubscribed(chatId) {
    return this.subscriptions.has(chatId);
  }

  // Get subscription info
  getSubscription(chatId) {
    return this.subscriptions.get(chatId);
  }

  // Get all active subscriptions
  getActiveSubscriptions() {
    return Array.from(this.subscriptions.keys());
  }

  // Re-subscribe to all chats (useful after reconnection)
  async resubscribeAll() {
    const chatIds = Array.from(this.subscriptions.keys());
    const resubscribePromises = chatIds.map(async (chatId) => {
      const subscription = this.subscriptions.get(chatId);
      if (subscription) {
        try {
          // Unsubscribe first
          await this.unsubscribe(chatId);
          // Then re-subscribe with original callbacks
          await this.subscribe(chatId, subscription.callbacks);
        } catch (error) {
          console.error(`Failed to resubscribe to chat ${chatId}:`, error);
        }
      }
    });

    await Promise.allSettled(resubscribePromises);
  }

  // Send message to specific chat topic
  sendToChatTopic(chatId, destination, message) {
    return this.wsService.send(`/app/chat/${chatId}${destination}`, message);
  }

  // Join chat room (notify other users)
  joinRoom(chatId, user) {
    return this.sendToChatTopic(chatId, "/join", {
      type: "USER_JOIN",
      user,
      timestamp: new Date().toISOString(),
    });
  }

  // Leave chat room (notify other users)
  leaveRoom(chatId, user) {
    return this.sendToChatTopic(chatId, "/leave", {
      type: "USER_LEAVE",
      user,
      timestamp: new Date().toISOString(),
    });
  }

  // Send typing indicator
  sendTypingIndicator(chatId, user, isTyping) {
    return this.sendToChatTopic(chatId, "/typing", {
      type: "TYPING",
      user,
      isTyping,
      timestamp: new Date().toISOString(),
    });
  }

  // Cleanup all subscriptions
  cleanup() {
    const chatIds = Array.from(this.subscriptions.keys());
    chatIds.forEach((chatId) => {
      this.unsubscribe(chatId).catch((error) => {
        console.error(`Error during cleanup for chat ${chatId}:`, error);
      });
    });
  }
}

export default SubscriptionManager;
