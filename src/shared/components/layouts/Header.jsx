// Header.jsx
import React from "react";
export default function Header({ title, children }) {
  return (
    <header className="w-full bg-gray-900 text-white px-4 py-2 flex items-center justify-between">
      <span className="font-bold text-lg">{title}</span>
      {children}
    </header>
  );
}
