import React from "react";

export default function OAuthButtons() {
  const googleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const githubLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/github";
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={googleLogin}
        className="bg-red-600 hover:bg-red-700 text-white rounded px-4 py-2 font-semibold"
      >
        Login with Google
      </button>
      <button
        onClick={githubLogin}
        className="bg-gray-800 hover:bg-gray-900 text-white rounded px-4 py-2 font-semibold"
      >
        Login with GitHub
      </button>
    </div>
  );
}
