import React from "react";
import { AuthProvider } from "../features/auth";
import { ChatProvider, TypingProvider } from "../features/chat";

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ChatProvider>
        <TypingProvider>{children}</TypingProvider>
      </ChatProvider>
    </AuthProvider>
  );
}
