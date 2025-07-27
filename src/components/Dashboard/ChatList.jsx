import React from "react";
import { useChat } from "../../hooks/useChat";
import ChatCard from "./ChatCard";

// Import icons
import { FiUserPlus, FiUsers } from "react-icons/fi";

export default function ChatList() {
  const { chatList, chatType, selectedChat, setSelectedChat } = useChat();

  // Render button based on chatType
  function renderCreateButton() {
    if (chatType === "oneToOne") {
      return (
        <button
          className="flex items-center bg-[#ae7aff] text-black px-3 py-1 rounded font-semibold gap-2"
          onClick={() => alert("Create Chat clicked")}
        >
          <FiUserPlus size={18} />
          New Chat
        </button>
      );
    } else if (chatType === "group") {
      return (
        <button
          className="flex items-center bg-[#ae7aff] text-black px-3 py-1 rounded font-semibold gap-2"
          onClick={() => alert("Create Group clicked")}
        >
          <FiUsers size={18} />
          New Group
        </button>
      );
    }
    return null;
  }

  return (
    <div className="w-1/3 border-r border-gray-700 overflow-y-auto bg-[#1c1c1c] p-4 max-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-xl">Chats</h3>
        <div>{renderCreateButton()}</div>
      </div>
      {chatList.length === 0 && <p>No chats available.</p>}
      {chatList.map((chat) => (
        <ChatCard
          key={chat.id}
          chat={chat}
          selected={selectedChat?.id === chat.id}
          onClick={() => setSelectedChat(chat)}
        />
      ))}
    </div>
  );
}
