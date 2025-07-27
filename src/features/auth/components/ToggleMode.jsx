import React from "react";

export default function ToggleMode({ authMode, setAuthMode }) {
  return (
    <div className="text-center text-sm text-gray-400 mt-4">
      {authMode === "login" ? (
        <>
          Don't have an account?{" "}
          <button
            onClick={() => setAuthMode("register")}
            className="text-[#ae7aff] font-semibold hover:underline"
          >
            Register
          </button>
        </>
      ) : (
        <>
          Already have an account?{" "}
          <button
            onClick={() => setAuthMode("login")}
            className="text-[#ae7aff] font-semibold hover:underline"
          >
            Login
          </button>
        </>
      )}
    </div>
  );
}
