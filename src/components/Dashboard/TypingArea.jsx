import React, { useState } from "react";
import { useChat } from "../../hooks/useChat";
export default function TypingArea() {
  const { sendMessage, getAISummary, typing, setTyping } = useChat();
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim() === "") return;
    sendMessage(text.trim());
    setText("");
    setTyping(false);
  };

  const handleChange = (e) => {
    setText(e.target.value);
    setTyping(e.target.value.length > 0);
  };

  return (
    <footer className="flex items-center gap-2 p-4 border-t border-gray-700 bg-[#292929]">
      <textarea
        className="flex-grow resize-none p-3 rounded bg-black text-white border border-gray-600 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#ae7aff]"
        rows={1}
        placeholder="Type a message..."
        value={text}
        onChange={handleChange}
      />
      <button
        onClick={handleSend}
        disabled={text.trim() === ""}
        className="bg-[#ae7aff] px-4 py-2 font-bold text-black rounded disabled:opacity-50"
      >
        Send
      </button>
      <button
        onClick={getAISummary}
        className="bg-purple-700 hover:bg-purple-900 px-4 py-2 font-bold text-white rounded"
      >
        AI Summary
      </button>
    </footer>
  );
}
