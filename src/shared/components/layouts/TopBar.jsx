// TopBar.jsx
import React from "react";
export default function TopBar({ userName, onLogout }) {
  return (
    <header className="fixed top-0 left-0 w-full h-12 bg-gray-900 text-white flex items-center justify-between px-4 z-50">
      <div className="font-semibold text-sm">Welcome, {userName}</div>
      <button
        onClick={onLogout}
        className="bg-[#ae7aff] text-black px-3 py-1 rounded text-sm font-bold hover:bg-[#915adb]"
      >
        Logout
      </button>
    </header>
  );
}
