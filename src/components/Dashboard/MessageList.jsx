import React, { useRef, useEffect } from "react";
import { useChat } from "../../hooks/useChat";
export default function MessageList() {
  const { messages } = useChat();
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-[#1e1e1e]">
      {messages.length === 0 && (
        <p className="text-center text-gray-400 select-none">
          No messages yet. Start chatting!
        </p>
      )}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`max-w-md p-2 rounded ${
            msg.sender === "Me"
              ? "bg-[#ae7aff] text-black self-end"
              : "bg-gray-700 text-white self-start"
          }`}
        >
          <p className="break-words whitespace-pre-wrap">{msg.content}</p>
          <small className="block text-xs text-gray-300 mt-1">
            {msg.timestamp}
          </small>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
