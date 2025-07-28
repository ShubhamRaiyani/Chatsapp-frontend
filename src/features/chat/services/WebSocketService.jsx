// features/chat/services/WebSocketService.js - Add persistence
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.connecting = false;
    this.currentSubscription = null;
    this.messageCallbacks = new Set();
    this.connectionCallbacks = new Set();
    this.subscriptionCallbacks = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.connectionRequested = false; // NEW: Track if connection was explicitly requested
  }

  connect(authToken = null) {
    // Prevent multiple connection attempts
    if (this.connected || this.connecting) {
      console.log("WebSocket already connected or connecting");
      return Promise.resolve();
    }

    // Mark connection as explicitly requested
    this.connectionRequested = true;
    this.connecting = true;
    this.reconnectAttempts = 0;

    return new Promise((resolve, reject) => {
      try {
        const socket = new SockJS("http://localhost:8080/ws");

        this.stompClient = new Client({
          webSocketFactory: () => socket,
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          connectHeaders: authToken
            ? { Authorization: `Bearer ${authToken}` }
            : {},
          debug: (str) => {
            console.log("STOMP Debug:", str);
          },
        });

        this.stompClient.onConnect = (frame) => {
          console.log("✅ WebSocket Connected:", frame);
          this.connected = true;
          this.connecting = false;
          this.reconnectAttempts = 0;

          this.connectionCallbacks.forEach((callback) => {
            try {
              callback(true);
            } catch (error) {
              console.error("Connection callback error:", error);
            }
          });
          resolve();
        };

        this.stompClient.onStompError = (frame) => {
          console.error("❌ WebSocket STOMP Error:", frame);
          this.connected = false;
          this.connecting = false;
          this.handleConnectionError();
          reject(new Error("STOMP connection failed"));
        };

        this.stompClient.onWebSocketError = (error) => {
          console.error("❌ WebSocket Error:", error);
          this.connected = false;
          this.connecting = false;
          this.handleConnectionError();
          reject(error);
        };

        this.stompClient.onDisconnect = () => {
          console.log("🔌 WebSocket Disconnected");
          this.connected = false;
          this.currentSubscription = null;

          this.connectionCallbacks.forEach((callback) => {
            try {
              callback(false);
            } catch (error) {
              console.error("Connection callback error:", error);
            }
          });

          // Only attempt reconnect if connection was requested and not explicitly disconnected
          if (
            this.connectionRequested &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.attemptReconnect(authToken);
          }
        };

        this.stompClient.activate();
      } catch (error) {
        console.error("WebSocket connection setup failed:", error);
        this.connecting = false;
        reject(error);
      }
    });
  }

  // NEW: Handle connection errors with backoff
  handleConnectionError() {
    if (
      this.connectionRequested &&
      this.reconnectAttempts < this.maxReconnectAttempts
    ) {
      this.attemptReconnect();
    }
  }

  // NEW: Reconnection logic with exponential backoff
  attemptReconnect(authToken = null) {
    this.reconnectAttempts++;
    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff

    console.log(
      `🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`
    );

    setTimeout(() => {
      if (this.connectionRequested && !this.connected && !this.connecting) {
        this.connect(authToken).catch(console.error);
      }
    }, delay);
  }

  // Enhanced disconnect with explicit flag
  disconnect() {
    this.connectionRequested = false; // Mark connection as no longer requested

    if (this.stompClient && this.connected) {
      console.log("🔌 Disconnecting WebSocket");

      if (this.currentSubscription) {
        this.currentSubscription.unsubscribe();
        this.currentSubscription = null;
      }

      this.stompClient.deactivate();
      this.connected = false;
    }
  }

  // Rest of your existing methods remain the same...
  subscribeToChat(chatId, isGroup = false) {
    if (!this.connected || !this.stompClient) {
      console.error("WebSocket not connected");
      return null;
    }

    if (this.currentSubscription) {
      console.log("🔄 Unsubscribing from previous chat");
      this.currentSubscription.unsubscribe();
      this.currentSubscription = null;
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
            const messageData = JSON.parse(message.body);
            console.log("📨 Received message:", messageData);

            this.messageCallbacks.forEach((callback) => {
              try {
                callback(messageData);
              } catch (error) {
                console.error("Message callback error:", error);
              }
            });
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        }
      );

      this.subscriptionCallbacks.forEach((callback) => {
        try {
          callback(chatId, isGroup);
        } catch (error) {
          console.error("Subscription callback error:", error);
        }
      });

      return this.currentSubscription;
    } catch (error) {
      console.error("Subscription failed:", error);
      return null;
    }
  }

  sendMessage(messageData) {
    if (!this.connected || !this.stompClient) {
      console.error("WebSocket not connected");
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
      console.error("Failed to send message:", error);
      return false;
    }
  }

  // Your existing callback methods remain unchanged...
  onMessage(callback) {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  onConnectionChange(callback) {
    this.connectionCallbacks.add(callback);
    callback(this.connected); // Call immediately with current status
    return () => this.connectionCallbacks.delete(callback);
  }

  isConnected() {
    return this.connected;
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
