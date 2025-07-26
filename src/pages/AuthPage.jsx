import React, { useState } from "react";
import ToggleMode from "../components/Auth/ToggleMode";
import LoginForm from "../components/Auth/LoginForm";
import RegisterForm from "../components/Auth/RegisterForm";
import OAuthButtons from "../components/Auth/OAuthButtons";

export default function AuthPage() {
  const [authMode, setAuthMode] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      authMode === "login"
        ? `Logging in with ${formData.email}`
        : `Registering ${formData.username} (${formData.email})`
    );
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-slate-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span><img src="/logo.png" alt="MyApp Logo" className="h-15 w-10" /></span> <span>Chatsapp</span>
        </h1>
        <ToggleMode authMode={authMode} setAuthMode={setAuthMode} />
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold mb-2 text-center">
            {authMode === "login" ? "Login" : "Register"}
          </h2>
          <p className="text-sm text-slate-400 mb-6 text-center">
            {authMode === "login"
              ? "Login to access your account"
              : "Create your account to get started"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === "login" ? (
              <LoginForm formData={formData} handleChange={handleChange} />
            ) : (
              <RegisterForm formData={formData} handleChange={handleChange} />
            )}

            <button
              type="submit"
              className="w-full bg-[#ae7aff] text-black font-bold p-2 rounded hover:bg-[#c19aff]"
            >
              {authMode === "login" ? "Login" : "Register"}
            </button>
          </form>

          <div className="my-4 flex items-center text-sm text-gray-400 gap-2">
            <hr className="flex-grow border-gray-600" />
            <span>OR</span>
            <hr className="flex-grow border-gray-600" />
          </div>

          <OAuthButtons />
        </div>
      </main>
    </div>
  );
}
