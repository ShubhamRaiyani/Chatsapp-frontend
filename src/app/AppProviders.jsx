import React from "react";
import { AuthProvider } from "../features/auth";
import {
  ChatProvider,
  TypingProvider,
  SubscriptionProvider,
} from "../features/chat";

/**
 * AppProviders
 * Wraps the application with all necessary context providers.
 * Order of nesting is preserved from original App.jsx:
 * AuthProvider -> ChatProvider -> TypingProvider -> SubscriptionProvider
 */
export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ChatProvider>
        <TypingProvider>
          <SubscriptionProvider>{children}</SubscriptionProvider>
        </TypingProvider>
      </ChatProvider>
    </AuthProvider>
  );
}
