import React from "react";
import { AuthProvider } from "../features/auth";
import { ChatProvider, TypingProvider } from "../features/chat";
import { CallProvider } from "../features/call/context/CallProvider";
import IncomingCallModal from "../features/call/components/IncomingCallModal";
import CallScreen from "../features/call/components/CallScreen";

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ChatProvider>
        <TypingProvider>
          <CallProvider>
            {children}
            {/* Global call overlays — rendered once, always on top */}
            <IncomingCallModal />
            <CallScreen />
          </CallProvider>
        </TypingProvider>
      </ChatProvider>
    </AuthProvider>
  );
}
