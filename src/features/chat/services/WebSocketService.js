// features/chat/services/WebSocketService.js
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
const WS_BASE =
  import.meta.env.VITE_WS_BASE_URL || "http://localhost:8080/ws";

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.connecting = false;
    this.connectionPromise = null;
    this.sessionId = null;
    // Map of chatId/groupId → STOMP subscription (one per chat)
    this.subscriptions = new Map();
    this.notificationSubscription = null;
    this.messageCallbacks = new Set();
    this.connectionCallbacks = new Set();
    this.notificationCallbacks = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
  }

  async connect(userSessionId = null) {
    if (this.connected && this.sessionId === userSessionId) {
      console.log("✅ WebSocket already connected for session:", userSessionId);
      return Promise.resolve();
    }
    if (this.sessionId && this.sessionId !== userSessionId) {
      console.log("🔄 New session detected, disconnecting previous");
      await this.forceDisconnect();
    }
    if (this.connectionPromise && this.sessionId === userSessionId) {
      console.log("🔄 Connection in progress for session:", userSessionId);
      return this.connectionPromise;
    }
    this.sessionId = userSessionId;
    this.connecting = true;
    this.reconnectAttempts = 0;
    this.connectionPromise = this._createConnection();
    try {
      await this.connectionPromise;
      return Promise.resolve();
    } catch (error) {
      this.connectionPromise = null;
      throw error;
    }
  }

  _createConnection() {
    return new Promise((resolve, reject) => {
      console.log("🚀 Creating WebSocket connection...");
      const socket = new SockJS(WS_BASE, null, { withCredentials: true });
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 0,
        heartbeatIncoming: 25000,
        heartbeatOutgoing: 25000,
        connectHeaders: {},
        debug: (str) => {
          if (
            str.includes("Opening") ||
            str.includes("CONNECT") ||
            str.includes("CONNECTED") ||
            str.includes("ERROR")
          ) {
            console.log("STOMP:", str);
          }
        },
      });

      const timeout = setTimeout(() => {
        console.error("❌ WebSocket connection timeout");
        this._cleanup();
        reject(new Error("Connection timeout"));
      }, 15000);

      this.stompClient.onConnect = (frame) => {
        clearTimeout(timeout);
        console.log("✅ WebSocket Connected:", frame.headers["user-name"] || "User");
        this.connected = true;
        this.connecting = false;
        this.connectionPromise = null;
        this.reconnectAttempts = 0;

        // Personal notification queue (backup for edge cases)
        this.notificationSubscription = this.stompClient.subscribe(
          "/user/queue/notifications",
          (message) => {
            try {
              const data = JSON.parse(message.body);
              this.notificationCallbacks.forEach((cb) => {
                try { cb(data); } catch (e) { console.error("Notification callback error:", e); }
              });
            } catch (e) {
              console.error("Notification parse error:", e);
            }
          }
        );

        this.connectionCallbacks.forEach((cb) => {
          try { cb(true); } catch (e) { console.error("Callback error:", e); }
        });
        resolve();
      };

      this.stompClient.onStompError = (frame) => {
        clearTimeout(timeout);
        console.error("❌ STOMP Error:", frame.headers.message);
        this._cleanup();
        reject(new Error(`STOMP Error: ${frame.headers.message}`));
      };

      this.stompClient.onWebSocketError = (error) => {
        clearTimeout(timeout);
        console.error("❌ WebSocket Error:", error);
        this._cleanup();
        reject(error);
      };

      this.stompClient.onDisconnect = () => {
        console.log("🔌 WebSocket Disconnected");
        this.connected = false;
        // All subscriptions are dead after disconnect — clear the map
        this.subscriptions.clear();
        this.connectionCallbacks.forEach((cb) => {
          try { cb(false); } catch (e) { console.error("Callback error:", e); }
        });
        if (this.sessionId && this.reconnectAttempts < this.maxReconnectAttempts) {
          this._scheduleReconnect();
        }
      };

      this.stompClient.activate();
    });
  }

  _scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = Math.min(Math.pow(2, this.reconnectAttempts) * 1000, 30000);
    console.log(`🔄 Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    setTimeout(() => {
      if (this.sessionId && !this.connected && !this.connecting) {
        this.connecting = false;
        this.connect(this.sessionId).catch(console.error);
      }
    }, delay);
  }

  async forceDisconnect() {
    this.subscriptions.forEach((sub) => {
      try { sub.unsubscribe(); } catch (e) {}
    });
    this.subscriptions.clear();
    if (this.stompClient) {
      try { this.stompClient.forceDisconnect(); } catch (e) {}
    }
    this._cleanup();
  }

  disconnect() {
    if (this.stompClient && this.connected) {
      console.log("🔌 Gracefully disconnecting WebSocket");
      try {
        this.subscriptions.forEach((sub) => { try { sub.unsubscribe(); } catch (e) {} });
        this.subscriptions.clear();
        this.stompClient.deactivate();
      } catch (error) {
        console.warn("Disconnect warning:", error);
      }
    }
    this._cleanup();
  }

  _cleanup() {
    this.connected = false;
    this.connecting = false;
    this.connectionPromise = null;
    this.sessionId = null;
    this.subscriptions.clear();
  }

  // Subscribe to a single chat/group topic (idempotent — skips if already subscribed)
  subscribeToChat(chatId, isGroup = false) {
    if (!this.connected) {
      console.error("❌ Cannot subscribe: not connected");
      return null;
    }
    if (this.subscriptions.has(chatId)) {
      return this.subscriptions.get(chatId);
    }
    const destination = isGroup ? `/topic/group/${chatId}` : `/topic/chat/${chatId}`;
    try {
      console.log(`📝 Subscribing to: ${destination}`);
      const sub = this.stompClient.subscribe(destination, (message) => {
        try {
          const data = JSON.parse(message.body);
          this.messageCallbacks.forEach((cb) => {
            try { cb(data); } catch (e) { console.error("Message callback error:", e); }
          });
        } catch (e) {
          console.error("Message parse error:", e);
        }
      });
      this.subscriptions.set(chatId, sub);
      return sub;
    } catch (error) {
      console.error("❌ Subscribe failed:", error);
      return null;
    }
  }

  // Subscribe to all chats at once (called after loadChats or on reconnect)
  subscribeToAllChats(chats) {
    if (!this.connected || !chats?.length) return;
    chats.forEach((chat) => this.subscribeToChat(chat.id, chat.isGroup));
    console.log(`📋 Subscribed to ${chats.length} chat topics`);
  }

  // Remove subscription for a specific chat (e.g. after leaving a group)
  unsubscribeFromChat(chatId) {
    const sub = this.subscriptions.get(chatId);
    if (sub) {
      try { sub.unsubscribe(); } catch (e) {}
      this.subscriptions.delete(chatId);
    }
  }

  sendMessage(messageData) {
    if (!this.connected) {
      console.error("❌ Cannot send: not connected");
      return false;
    }
    try {
      this.stompClient.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(messageData),
      });
      return true;
    } catch (error) {
      console.error("❌ Send failed:", error);
      return false;
    }
  }

  onMessage(callback) {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  onNotification(callback) {
    this.notificationCallbacks.add(callback);
    return () => this.notificationCallbacks.delete(callback);
  }

  onConnectionChange(callback) {
    this.connectionCallbacks.add(callback);
    callback(this.connected);
    return () => this.connectionCallbacks.delete(callback);
  }

  isConnected() {
    return this.connected;
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
