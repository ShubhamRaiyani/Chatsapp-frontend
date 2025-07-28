// src/pages/DashboardPage.jsx - Remove providers from here
import React from "react";
import Dashboard from "../features/chat/containers/Dashboard";
import { useAuth } from "../features/auth/hooks/useAuth";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <header className="w-full bg-gray-900 text-white flex items-center justify-between px-4 py-2 fixed top-0 left-0 right-0 z-50 h-12">
        <div className="text-sm font-semibold">
          Welcome, {user ? user.username : "User"}!
        </div>
        <button
          onClick={logout}
          className="bg-purple-600 px-3 py-1 rounded text-sm hover:bg-purple-700 transition"
        >
          Logout
        </button>
      </header>

      {/* Dashboard is now inside providers from App level */}
      <Dashboard />
    </div>
  );
}
