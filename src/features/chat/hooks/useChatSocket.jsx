// chat/hooks/useChatSocket.js
import { useEffect, useRef, useCallback, useState } from "react";
import WebSocketService from "../services/WebSocketService";
import { useAuth } from "../../auth";

export function useChatSocket(callbacks = {}) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsService = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const { user, isAuthenticated } = useAuth();

  // Initialize WebSocket connection with JWT token
  const connect = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log("User not authenticated, skipping WebSocket connection");
      return;
    }

    try {
      if (!wsService.current) {
        wsService.current = WebSocketService;
      }

      // Get JWT token for authentication - adjust based on your auth storage
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("jwt="))
          ?.split("=")[1];

      await wsService.current.connect(token);
      setConnected(true);
      setError(null);
      reconnectAttempts.current = 0;

      // Subscribe to user-specific queues if callbacks provided
      if (callbacks.onMessage) {
        wsService.current.subscribe(
          "/user/queue/messages",
          callbacks.onMessage
        );
      }

      if (callbacks.onTyping) {
        wsService.current.subscribe("/user/queue/typing", callbacks.onTyping);
      }

      if (callbacks.onPresence) {
        wsService.current.subscribe(
          "/user/queue/presence",
          callbacks.onPresence
        );
      }

      if (callbacks.onNotification) {
        wsService.current.subscribe(
          "/user/queue/notifications",
          callbacks.onNotification
        );
      }
    } catch (err) {
      setError(err.message);
      setConnected(false);
      console.error("WebSocket connection failed:", err);

      // Attempt reconnection with exponential backoff
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        const backoffTime = Math.pow(2, reconnectAttempts.current) * 1000;
        setTimeout(() => {
          connect();
        }, backoffTime);
      }
    }
  }, [callbacks, isAuthenticated, user]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (wsService.current) {
      wsService.current.disconnect();
      setConnected(false);
    }
  }, []);

  // Send message through WebSocket - matches backend @MessageMapping("/chat.send")
  const sendMessage = useCallback(
    (destination, message) => {
      if (wsService.current && connected) {
        try {
          if (destination === "/app/chat.send") {
            // Use the dedicated sendMessage method for chat messages
            return wsService.current.sendMessage(message);
          } else {
            // Use generic send for other destinations
            return wsService.current.send(destination, message);
          }
        } catch (err) {
          console.error("Failed to send WebSocket message:", err);
          setError(err.message);
          return false;
        }
      } else {
        console.warn("WebSocket not connected, cannot send message");
        return false;
      }
    },
    [connected]
  );

  // Subscribe to a topic
  const subscribe = useCallback(
    (topic, callback) => {
      if (wsService.current && connected) {
        return wsService.current.subscribe(topic, callback);
      }
      return null;
    },
    [connected]
  );

  // Initialize connection on mount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Handle connection state changes
  useEffect(() => {
    if (wsService.current) {
      const handleConnect = () => {
        setConnected(true);
        setError(null);
        callbacks.onConnect?.();
      };

      const handleDisconnect = () => {
        setConnected(false);
        callbacks.onDisconnect?.();
      };

      const handleError = (error) => {
        setError(error.message);
        callbacks.onError?.(error);
      };

      // Set up WebSocket service callbacks
      const unsubscribeConnection = wsService.current.onConnectionChange(
        (isConnected) => {
          if (isConnected) {
            handleConnect();
          } else {
            handleDisconnect();
          }
        }
      );

      return () => {
        unsubscribeConnection();
      };
    }
  }, [callbacks]);

  return {
    connected,
    error,
    connect,
    disconnect,
    sendMessage,
    subscribe,
  };
}
