import React from "react";

export default function ToggleMode({ authMode, setAuthMode }) {
  return (
    <div className="space-x-2">
      <button
        className={`text-sm px-4 py-1 rounded border ${
          authMode === "login" ? "bg-white text-black" : "border-white"
        }`}
        onClick={() => setAuthMode("login")}
      >
        Login
      </button>
      <button
        className={`text-sm px-4 py-1 rounded border ${
          authMode === "register" ? "bg-white text-black" : "border-white"
        }`}
        onClick={() => setAuthMode("register")}
      >
        Register
      </button>
    </div>
  );
}
