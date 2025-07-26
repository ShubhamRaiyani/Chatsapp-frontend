import React from "react";

export default function OAuthButtons() {
  const googleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const githubLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/github";
  };

  return (
    <>
      <button
        onClick={googleLogin}
        className="w-full flex items-center justify-center gap-2 border border-white bg-black p-2 rounded text-sm"
      >
        <img src="/google-icon.svg" alt="Google" className="h-4 w-4" />
        Login with Google
      </button>

      <button
        onClick={githubLogin}
        className="mt-2 w-full flex items-center justify-center gap-2 border border-white bg-black p-2 rounded text-sm"
      >
        <img src="/github.svg" alt="GitHub" className="h-4 w-4" />
        Login with GitHub
      </button>
    </>
  );
}
