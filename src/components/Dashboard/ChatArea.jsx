import React from "react";
import { useChat } from "../../hooks/useChat";
import ChatTopBar from "./ChatTopBar";
import MessageList from "./MessageList";
import TypingArea from "./TypingArea";

// Error boundary for the entire chat area
class ChatAreaErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ChatArea Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="flex flex-col flex-grow bg-[#212121] items-center justify-center">
          <div className="text-center text-gray-400">
            <h2 className="text-xl font-semibold">Chat Error</h2>
            <p className="mb-4"> "We're having trouble loading the chat."</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-[#ae7aff] text-black px-6 py-2 rounded font-semibold hover:bg-opacity-90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

// Memoized empty state component
const EmptyState = React.memo(() => (
  <div className="flex-grow flex items-center justify-center text-gray-500">
    <div className="text-center">
      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-2">
        Select a chat to start messaging
      </h3>
      <p className="text-sm text-gray-400">
        Choose a conversation from the sidebar to begin
      </p>
    </div>
  </div>
));

export default function ChatArea() {
  const { selectedChat } = useChat();

  return (
    <ChatAreaErrorBoundary>
      {/* KEY FIX: Added pt-12 to push content below fixed header */}
      <section className="flex flex-col flex-grow bg-[#212121] pt-12">
        {selectedChat ? (
          <>
            <ChatTopBar chat={selectedChat} />
            <MessageList />
            <TypingArea />
          </>
        ) : (
          <div className="flex-grow">
            <EmptyState />
          </div>
        )}
      </section>
    </ChatAreaErrorBoundary>
  );
}
