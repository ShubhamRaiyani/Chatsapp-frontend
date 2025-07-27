import React from "react";
import Dashboard from "../components/Dashboard/Dashboard"; // Adjust path as needed
import { useAuth } from "../features/auth/hooks/useAuth"; // Adjust path as needed
import { ChatProvider}  from "../contexts/ChatProvider";
export default function DashboardPage() {
  const { user, logout } = useAuth();

  // Optionally keep the welcome/logout header here and render Dashboard below
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Optional header */}
      <header className="w-full bg-gray-900 text-white flex items-center justify-between px-4 py-2 fixed top-0 left-0 right-0 z-50 h-12">
        <div className="text-sm font-semibold">Welcome, {user ? user.username : "User"}!</div>
        <button
          onClick={logout}
          className="bg-purple-600 px-3 py-1 rounded text-sm hover:bg-purple-700 transition"
        >
          Logout
        </button>
      </header>

      {/* Full dashboard chat UI */}
      <ChatProvider>
        <Dashboard />
      </ChatProvider>
    </div>
  );
}
