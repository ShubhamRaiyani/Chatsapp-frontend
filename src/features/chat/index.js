// chat/index.js

// Export all components
export { default as Avatar } from './components/ui/Avatar';
export { default as MessageBubble } from './components/ui/MessageBubble';
export { default as TypingIndicator } from './components/ui/TypingIndicator';
export { default as ReadReceipt } from './components/ui/ReadReceipt';

export { default as ChatTopBar } from './components/ChatTopBar';
export { default as MessageList } from './components/MessageList';
export { default as TypingArea } from './components/TypingArea';
export { default as ChatCard } from './components/ChatCard';
export { default as Sidebar } from './components/Sidebar';
export { default as EmptyState } from './components/EmptyState';

// Export containers
export { default as ChatArea } from './containers/ChatArea';
export { default as ChatList } from './containers/ChatList';
export { default as Dashboard } from './containers/Dashboard';

// Export context and providers
export { default as ChatContext } from './context/ChatContext';
export { ChatProvider } from './context/ChatProvider';

export { default as SubscriptionContext } from './context/SubscriptionContext';
export { SubscriptionProvider } from './context/SubcriptionProvider';
export { useSubscriptionContext } from './context/SubscriptionContext';

export { default as TypingContext } from './context/TypingContext';
export { useTypingContext } from './context/TypingContext';
export { TypingProvider } from './context/TypingProvider';

// Export hooks
export { useChat } from './hooks/useChat';
export { useChatSocket } from './hooks/useChatSocket';
export { useSubscription as useChatSubscription } from './hooks/useSubscription';
export { useTyping } from './hooks/useTyping';
export { useReadReceipt } from './hooks/useReadReceipt';

// Export services
export { default as WebSocketService } from './services/WebSocketService';
export { default as ChatAPI } from './services/ChatAPI';
export { default as MessageService } from './services/MessageService';
export { default as SubscriptionManager } from './services/SubscriptionManager';

// Export utilities
export * from './utils/messageUtils';
export * from './utils/dateUtils';
export * from './utils/chatHelpers';

// Export types and constants
export * from './types/chat.types';
export * from './types/websocket.types';

// Default export - main Dashboard component
export { default } from './containers/Dashboard';