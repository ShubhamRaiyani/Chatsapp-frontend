// features/chat/services/WebSocketService.js
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const WS_BASE =
  import.meta.env.VITE_WS_BASE_URL || "http://localhost:8080/ws";
class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.connecting = false;
    this.connectionPromise = null;
    this.sessionId = null;
    this.currentSubscription = null;
    this.messageCallbacks = new Set();
    this.connectionCallbacks = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
  }

  // ✅ Single connection per user session
  async connect(userSessionId = null) {
    // Same session and connected - return immediately
    if (this.connected && this.sessionId === userSessionId) {
      console.log("✅ WebSocket already connected for session:", userSessionId);
      return Promise.resolve();
    }

    // Different session - disconnect first
    if (this.sessionId && this.sessionId !== userSessionId) {
      console.log("🔄 New session detected, disconnecting previous");
      await this.forceDisconnect();
    }

    // Connection in progress for this session
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

  _createConnection() { // Create a new WebSocket connection
    return new Promise((resolve, reject) => {
      console.log("🚀 Creating WebSocket connection...");

      // ✅ SockJS with credentials for HttpOnly cookies
      const socket = new SockJS(WS_BASE, null, {
        withCredentials: true,
      });

      this.stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 0, // Manual reconnection
        heartbeatIncoming: 25000,
        heartbeatOutgoing: 25000,
        connectHeaders: {}, // ✅ No headers needed - cookie handles auth
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
        console.log(
          "✅ WebSocket Connected:",
          frame.headers["user-name"] || "User"
        );

        this.connected = true;
        this.connecting = false;
        this.connectionPromise = null;
        this.reconnectAttempts = 0;

        this.connectionCallbacks.forEach((cb) => {
          try {
            cb(true);
          } catch (e) {
            console.error("Callback error:", e);
          }
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
        this.currentSubscription = null;

        this.connectionCallbacks.forEach((cb) => {
          try {
            cb(false);
          } catch (e) {
            console.error("Callback error:", e);
          }
        });

        if (
          this.sessionId &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this._scheduleReconnect();
        }
      };

      this.stompClient.activate();
    });
  }

  _scheduleReconnect() { // Schedule a reconnect with exponential backoff
    this.reconnectAttempts++;
    const delay = Math.min(Math.pow(2, this.reconnectAttempts) * 1000, 30000);

    console.log(
      `🔄 Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`
    );

    setTimeout(() => {
      if (this.sessionId && !this.connected && !this.connecting) {
        this.connecting = false;
        this.connect(this.sessionId).catch(console.error);
      }
    }, delay);
  }

  async forceDisconnect() { // Force disconnect and cleanup
    if (this.currentSubscription) {
      try {
        this.currentSubscription.unsubscribe();
      } catch (e) {
        console.error("Unsubscribe error:", e);
      }
      this.currentSubscription = null;
    }
    if (this.stompClient) {
      try {
        this.stompClient.forceDisconnect();
      } catch (e) {
        console.error("Force disconnect error:", e);
      }
    }
    this._cleanup();
  }

  disconnect() {
    if (this.stompClient && this.connected) {
      console.log("🔌 Gracefully disconnecting WebSocket");
      try {
        if (this.currentSubscription) {
          this.currentSubscription.unsubscribe();
          this.currentSubscription = null;
        }
        this.stompClient.deactivate();
      } catch (error) {
        console.warn("Disconnect warning:", error);
      }
    }
    this._cleanup();
  }

  _cleanup() { // Reset state
    this.connected = false;
    this.connecting = false;
    this.connectionPromise = null;
    this.sessionId = null;
  }

  subscribeToChat(chatId, isGroup = false) {
    if (!this.connected) {
      console.error("❌ Cannot subscribe: not connected");
      return null;
    }

    if (this.currentSubscription) {
      try {
        this.currentSubscription.unsubscribe();
      } catch (e) {
        console.error("Unsubscribe error:", e);
      }
    }

    const destination = isGroup
      ? `/topic/group/${chatId}`
      : `/topic/chat/${chatId}`;

    try {
      console.log(`📝 Subscribing to: ${destination}`);
      this.currentSubscription = this.stompClient.subscribe(
        destination,
        (message) => {
          try {
            const data = JSON.parse(message.body);
            this.messageCallbacks.forEach((cb) => {
              try {
                cb(data);
              } catch (e) {
                console.error("Message callback error:", e);
              }
            });
          } catch (e) {
            console.error("Message parse error:", e);
          }
        }
      );
      return this.currentSubscription;
    } catch (error) {
      console.error("❌ Subscribe failed:", error);
      return null;
    }
  }

  sendMessage(messageData) {
    if (!this.connected) {
      console.error("❌ Cannot send: not connected");
      return false;
    }

    try {
      console.log("📤 Sending message:", messageData);
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

  onConnectionChange(callback) {
    this.connectionCallbacks.add(callback);
    callback(this.connected);
    return () => this.connectionCallbacks.delete(callback);
  }

  isConnected() {
    return this.connected;
  }
}

// ✅ Singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;
