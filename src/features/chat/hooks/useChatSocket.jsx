// features/chat/hooks/useChatSocket.js
import { useChat } from "./useChat";
import webSocketService from "../services/WebSocketService";

export function useChatSocket() {
  const { connected } = useChat();

  return {
    connected,
    sendMessage: (destination, message) => {
      if (!webSocketService.isConnected()) return false;
      try {
        webSocketService.stompClient.publish({
          destination,
          body: JSON.stringify(message),
        });
        return true;
      } catch (e) {
        console.error("useChatSocket sendMessage error:", e);
        return false;
      }
    },
    subscribe: () => {
      console.warn("Use selectChat from useChat instead of direct subscription");
      return null;
    },
  };
}
