import React, { useState } from "react";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import OAuthButtons from "../components/OAuthButtons";
import ToggleMode from "../components/ToggleMode";
import { useAuth } from "../hooks/useAuth";
import logo from "../../../assets/images/logo.png";
import { getCookieValue } from "../../../shared/utils/cookieUtils"; // Adjust the import path as needed
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    const result = await login(formData.email, formData.password);
    if (result.success) {
      // Store JWT token for WebSocket authentication
      const token = result.token || getCookieValue("jwt");
      if (token) {
        localStorage.setItem("authToken", token);
      }
      navigate("/dashboard");
    }
  };


  const handleRegister = async () => {
    const result = await register(
      formData.username,
      formData.email,
      formData.password
    );
    if (result.success) {
      alert(
        result.message || "Registration successful! Please verify your email."
      );
      setAuthMode("login");
      setFormData({ username: "", email: "", password: "" });
    } else {
      alert("Registration failed: " + result.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (authMode === "login") await handleLogin();
    else await handleRegister();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* --- Main Form Container --- */}
      <div className="relative z-10 w-full max-w-md mx-4 my-4 overflow-hidden">
        <div
          className="
          bg-[#12121f]            /* DARK solid background */
          text-gray-100           /* LIGHT text */
          rounded-3xl shadow-2xl border border-gray-800
          p-6 sm:p-8
          max-h-[calc(100vh-2rem)] overflow-y-auto
          flex flex-col
        "
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-4 flex-shrink-0">
            <img
              src={logo}
              alt="MyApp Logo"
              className="bg-transparent w-20 h-20 sm:w-16 sm:h-16 object-contain  shadow-lg"
            />
            <h2 className="mt-3 text-xl sm:text-2xl font-bold tracking-wide text-center">
              Welcome to MyApp
            </h2>
            <h1 className="mt-1 text-lg sm:text-xl font-semibold text-center">
              {authMode === 'login' ? 'Login' : 'Create Account'}
            </h1>
          </div>

          {/* Form */}
          <div className="flex-1 flex flex-col justify-center min-h-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'login' ? (
                <LoginForm formData={formData} handleChange={handleChange} />
              ) : (
                <RegisterForm formData={formData} handleChange={handleChange} />
              )}

              <button
                type="submit"
                className="
                w-full bg-[#ae7aff] text-black font-semibold py-3 px-4 rounded-lg mt-6
                hover:bg-[#915adb] transition-all
                focus:outline-none focus:ring-2 focus:ring-[#ae7aff] focus:ring-offset-2 focus:ring-offset-[#12121f]
              "
              >
                {authMode === 'login' ? 'Login' : 'Create Account'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 mt-4 space-y-4">
            <ToggleMode authMode={authMode} setAuthMode={setAuthMode} />

            <div className="border-t border-gray-700 pt-4">
              <p className="text-center text-gray-400 text-sm mb-3">
                Or continue with
              </p>
              <OAuthButtons />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}