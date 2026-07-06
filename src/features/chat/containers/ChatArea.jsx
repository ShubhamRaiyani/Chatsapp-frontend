import React, { useState, useEffect, useCallback } from "react";
import ChatTopBar from "../components/ChatTopBar";
import MessageList from "../components/MessageList";
import TypingArea from "../components/TypingArea";
import EmptyState from "../components/EmptyState";
import ChatInfoPanel from "../components/ChatInfoPanel.jsx";
import { useChat } from "../hooks/useChat";
import { useTyping } from "../hooks/useTyping";
import { useAuth } from "../../auth/hooks/useAuth";
import webSocketService from "../services/WebSocketService";
import ChatAPI from "../services/ChatAPI";

const ChatArea = ({ chat, currentUserId, onBack, className = "" }) => {
  const { user } = useAuth();
  const {
    messages,
    sendMessage,
    loadMoreMessages,
    hasMoreMessages,
    loading,
    connected,
    refreshChats,
    refreshMessages,
    leaveGroup,
  } = useChat(chat?.id);

  const { typingUsers, startTyping, stopTyping } = useTyping(
    chat?.id,
    chat?.isGroup || false,
    currentUserId
  );

  const [isConnected, setIsConnected] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [showChatInfo, setShowChatInfo] = useState(false);

  // The other person's email (null for groups)
  const otherUserEmail = !chat?.isGroup
    ? chat?.receiverEmail ||
      chat?.participantEmails?.find((e) => e !== currentUserId)
    : null;

  // Initialise from the service's persistent map so we don't start blind after a chat switch
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(
    () => (otherUserEmail ? (webSocketService.isUserOnline(otherUserEmail) ?? false) : false)
  );

  // Re-sync when the chat changes and subscribe to live updates
  useEffect(() => {
    if (!otherUserEmail) {
      setIsOtherUserOnline(false);
      return;
    }
    // Read the latest known value immediately (covers chat-switch case)
    setIsOtherUserOnline(webSocketService.isUserOnline(otherUserEmail) ?? false);

    const unsub = webSocketService.onPresence((event) => {
      if (event.userId === otherUserEmail) {
        setIsOtherUserOnline(event.online);
      }
    });
    return unsub;
  }, [otherUserEmail]);

  // Wrap typing callbacks so TypingArea doesn't need to know the user's identity
  const handleStartTyping = useCallback(() => {
    startTyping(currentUserId, user?.username || user?.name || currentUserId);
  }, [startTyping, currentUserId, user]);

  const handleStopTyping = useCallback(() => {
    stopTyping(currentUserId);
  }, [stopTyping, currentUserId]);


  

  useEffect(() => {
    setIsConnected(connected);
  }, [connected]);

  const handleSummarizeChat = async (chatId) => {
    if (!chatId || summaryLoading) return;
    console.log("Starting chat summary for chat ID:", chatId);
    setSummaryLoading(true);
    setSummaryError(null);

    try {
      console.log("Generating summary for chat:", chatId);
      const summary = await ChatAPI.generateChatSummary(chatId);

      // ✅ REFRESH MESSAGES TO SHOW NEW SUMMARY
      await refreshMessages(chatId, chat?.isGroup);

      // Optional: Also refresh chats list to update lastMessage
      setTimeout(() => refreshChats?.(), 500);

      return summary;
    } catch (error) {
      setSummaryError(error.message);
      throw error;
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSendMessage = async (messageData) => {
    try {
      if (chat && !chat.isGroup) {
        let receiverEmail = chat.receiverEmail;

        if (!receiverEmail && chat.participantEmails) {
          receiverEmail = chat.participantEmails.find(
            (email) => email !== currentUserId
          );
        }

        if (!receiverEmail) throw new Error("Unable to determine recipient");

        await sendMessage(messageData.content, receiverEmail);
      } else if (chat && chat.isGroup) {
        await sendMessage(messageData.content, null);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // ✅ NEW: Chat info panel handlers
  const handleShowInfo = () => {
    setShowChatInfo(true);
  };

  const handleShowMembers = () => {
    setShowChatInfo(true);
  };

  const handleCloseChatInfo = () => {
    setShowChatInfo(false);
  };

  // ✅ NEW: Chat action handlers
  const handleMuteChat = (chatId) => {
    console.log("Muting chat:", chatId);
    // Implement mute functionality
  };

  // const handleDeleteChat = (chatId) => {
  //   console.log("Deleting chat:", chatId);
  //   // Implement delete functionality
  //   if (confirm("Are you sure you want to delete this chat?")) {
  //     // Call your delete API
  //   }
  // };

  const handleLeaveGroup = async (groupId) => {
    try {
      await leaveGroup(groupId);
      // Optionally navigate back or show success message
      if (onBack) {
        onBack(); // Go back to chat list after leaving
      }
    } catch (error) {
      console.error("Failed to leave group:", error);
      throw error; // Re-throw so ChatTopBar can handle the error display
    }
  };


  if (!chat) {
    return (
      <EmptyState
        title="No chat selected"
        description="Select a conversation to start messaging"
        className={className}
      />
    );
  }
  

  return (
    <div className={`flex flex-col h-full w-full relative bg-[#0e0e1a] ${className}`}>
      {/* Chat Top Bar */}
      <div className="flex-shrink-0 border-b border-gray-700">
        <ChatTopBar
          chat={chat}
          onStartCall={() => console.log("Starting call")}
          onStartVideoCall={() => console.log("Starting video call")}
          onShowInfo={handleShowInfo}
          onShowMembers={handleShowMembers}
          onBack={onBack}
          onSummarize={(chatId) => handleSummarizeChat(chatId)}
          summaryLoading={summaryLoading}
          isOtherUserOnline={isOtherUserOnline}
        />
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-3">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent mr-3"></div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Reconnecting to chat...
            </p>
          </div>
        </div>
      )}

      {/* Summary Error */}
      {summaryError && (
        <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 p-3">
          <p className="text-sm text-red-700 dark:text-red-300">
            {summaryError}
          </p>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 min-h-0 relative">
        <MessageList
          key={chat.id} // ✅ force new MessageList per chat
          messages={messages}
          currentUserId={currentUserId}
          typingUsers={typingUsers}
          onEditMessage={() => {}}
          onDeleteMessage={() => {}}
          onReactToMessage={() => {}}
          onLoadMore={loadMoreMessages}
          hasMore={hasMoreMessages}
          loading={loading}
          UsernameofChat={chat?.displayName}
          className="h-full"
        />
      </div>

      {/* Typing Area */}
      <div className="flex-shrink-0 border-t border-gray-700">
        <TypingArea
          onSendMessage={handleSendMessage}
          onStartTyping={handleStartTyping}
          onStopTyping={handleStopTyping}
          chatId={chat?.id}
          disabled={!isConnected}
          placeholder={`Message ${chat?.displayName || "..."}`}
        />
      </div>

      {/* Chat Info Panel - Mobile overlay */}
      {showChatInfo && (
        // <div className="absolute inset-0 z-50 bg-gray-900">
        <ChatInfoPanel
          chat={chat}
          isOpen={showChatInfo}
          currentUserId={currentUserId}
          onClose={handleCloseChatInfo}
          onMuteChat={handleMuteChat}
          onLeaveGroup={handleLeaveGroup}
          onMembersUpdated={refreshChats}
        />
        // </div>
      )}
    </div>
  );
};

export default ChatArea;
