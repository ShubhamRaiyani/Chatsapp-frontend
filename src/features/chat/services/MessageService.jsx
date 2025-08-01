// chat/services/MessageService.js
import ChatAPI from "./ChatAPI";
import WebSocketService from "./WebSocketService";

class MessageService {
  constructor() {
    this.wsService = WebSocketService.getInstance();
  }

  // Send text message
  async sendMessage(messageData) {
    try {
      // Send via REST API first for persistence
      // const message = await ChatAPI.sendMessage(messageData.chatId, {
      //   content: messageData.content,
      //   type: messageData.type || "text",
      //   attachments: messageData.attachments || [],
      // });

      // Then broadcast via WebSocket for real-time delivery
      // MessageDTO
//         private UUID messageId;
//     private String content;  imp
// //    private String senderEmail;
//     private String receiverEmail; imp
//     private UUID chatId;  impp
//     private UUID groupId;  impp
      //     private String messageType;
      
      if (!messageData.chatId && !messageData.groupId) {
        throw new Error("Chat ID or Group ID is required to send a message");
      }

      if (!messageData.receiverEmail) {
        throw new Error("Receiver email is required to send a message");
      }
      if (!messageData.content) {
        throw new Error("Message content cannot be empty");
      }
    

      const message = this.wsService.sendMessage("/app/chat.send", {
        chatId: messageData.chatId || null,
        groupId: messageData.groupId || null,
        receiverEmail: messageData.receiverEmail,
        content: messageData.content,
        type: messageData.type || "text"
      });

      return message;
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  }

  // Send file message { Version 2 }
  async sendFileMessage(chatId, file, content = "") {
    try {
      // Upload file first
      const uploadResult = await ChatAPI.uploadFile(file, (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });

      // Send message with file attachment
      return this.sendMessage({
        chatId,
        content,
        type: file.type.startsWith("image/") ? "image" : "file",
        attachments: [
          {
            id: uploadResult.id,
            url: uploadResult.url,
            name: file.name,
            size: file.size,
            type: file.type,
          },
        ],
      });
    } catch (error) {
      console.error("Failed to send file message:", error);
      throw error;
    }
  }

  // Edit message { Version 2 }
  async editMessage(messageId, newContent) {
    try {
      const updatedMessage = await ChatAPI.editMessage(messageId, newContent);

      // Broadcast edit via WebSocket
      this.wsService.send("/app/chat.editMessage", {
        messageId,
        content: newContent,
        edited: true,
        editedAt: new Date().toISOString(),
      });

      return updatedMessage;
    } catch (error) {
      console.error("Failed to edit message:", error);
      throw error;
    }
  }

  // Delete message { Version 2 }
  async deleteMessage(messageId) {
    try {
      await ChatAPI.deleteMessage(messageId);

      // Broadcast deletion via WebSocket
      this.wsService.send("/app/chat.deleteMessage", {
        messageId,
      });
    } catch (error) {
      console.error("Failed to delete message:", error);
      throw error;
    }
  }

  // React to message  { Version 2 }
  async reactToMessage(messageId, emoji) {
    try {
      const updatedMessage = await ChatAPI.reactToMessage(messageId, emoji);

      // Broadcast reaction via WebSocket
      this.wsService.send("/app/chat.reactToMessage", {
        messageId,
        emoji,
        timestamp: new Date().toISOString(),
      });

      return updatedMessage;
    } catch (error) {
      console.error("Failed to react to message:", error);
      throw error;
    }
  }

  // Load messages with caching
  async loadMessages(chatId, page = 0, size = 50) {
    try {
      return await ChatAPI.getMessages(chatId, page, size); //CHECK if this is correct
    } catch (error) {
      console.error("Failed to load messages:", error);
      throw error;
    }
  }

  // Search messages
  async searchMessages(query, chatId = null) {
    try {
      return await ChatAPI.searchMessages(query, chatId);
    } catch (error) {
      console.error("Failed to search messages:", error);
      throw error;
    }
  }

  // Process incoming message from WebSocket
  processIncomingMessage(message) {
    try {
      const parsedMessage = JSON.parse(message.body);

      switch (parsedMessage.type) {
        case "MESSAGE":
          this.handleNewMessage(parsedMessage);
          break;
        case "MESSAGE_EDIT":
          this.handleMessageEdit(parsedMessage);
          break;
        case "MESSAGE_DELETE":
          this.handleMessageDelete(parsedMessage);
          break;
        case "MESSAGE_REACTION":
          this.handleMessageReaction(parsedMessage);
          break;
        default:
          console.log("Unknown message type:", parsedMessage.type);
      }
    } catch (error) {
      console.error("Failed to process incoming message:", error);
    }
  }

  // Handle new message
  handleNewMessage(messageData) {
    // This would typically update the local state
    console.log("New message received:", messageData);
  }

  // Handle message edit
  handleMessageEdit(editData) {
    console.log("Message edited:", editData);
  }

  // Handle message deletion
  handleMessageDelete(deleteData) {
    console.log("Message deleted:", deleteData);
  }

  // Handle message reaction
  handleMessageReaction(reactionData) {
    console.log("Message reaction:", reactionData);
  }
}

export default MessageService;
