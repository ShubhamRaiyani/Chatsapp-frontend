// features/chat/hooks/useChatSocket.js - SIMPLIFIED VERSION
import { useChat } from "./useChat";

export function useChatSocket() {
  const { connected, sendMessage } = useChat();

  return {
    connected,
    sendMessage: (destination, message) => {
      if (destination === "/app/chat.send") {
        return sendMessage(message.content, message.receiverEmail);
      }
      return false;
    },
    subscribe: () => {
      console.warn(
        "Use selectChat from useChat instead of direct subscription"
      );
      return null;
    },
  };
}
