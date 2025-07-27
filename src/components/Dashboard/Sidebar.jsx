import React from "react";
import { useChat } from "../../hooks/useChat"; // Adjust path as needed

export default function Sidebar() {
  const { chatType, setChatType } = useChat();

  return (
    <nav className="w-40 border-r border-gray-700 p-4 flex flex-col gap-4 bg-[#181818]">
      <h2 className="text-lg font-bold mb-4">Chat Type</h2>
      <button
        onClick={() => setChatType("oneToOne")}
        className={`py-2 rounded font-semibold ${
          chatType === "oneToOne"
            ? "bg-[#ae7aff] text-black"
            : "hover:bg-gray-700"
        }`}
      >
        One-to-One
      </button>
      <button
        onClick={() => setChatType("group")}
        className={`py-2 rounded font-semibold ${
          chatType === "group" ? "bg-[#ae7aff] text-black" : "hover:bg-gray-700"
        }`}
      >
        Group Chat
      </button>

      {/* Future nav items can go here */}
    </nav>
  );
}
