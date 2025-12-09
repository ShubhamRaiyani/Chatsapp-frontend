import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import OAuthButtons from "../components/OAuthButtons";
import ToggleMode from "../components/ToggleMode";
import { useAuth } from "../hooks/useAuth";
import logo from "../../../assets/images/logo.png";
import { getCookieValue } from "../../../shared/utils/cookieUtils";
import { useNavigate } from "react-router-dom"; // Ensure blink-animation CSS is imported

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [errors, setErrors] = useState({});

  // Blink effects removed, using toast instead
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = (mode) => {
    setAuthMode(mode);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (authMode === "register" && !formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        const token = result.token || getCookieValue("jwt");
        if (token) localStorage.setItem("authToken", token);
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error(result.message || "Login failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => { 
    setIsSubmitting(true);
    try {
      const result = await register(
        formData.username,
        formData.email,
        formData.password 
      );
      if (result.success) {
        toast.success(result.message || "Registration successful!");
        setFormData({ username: "", email: "", password: "" }); 
        setAuthMode("login");
      } else {
        toast.error(result.message || "Registration failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (authMode === "login") {
      await handleLogin();
    } else {
      await handleRegister();
    }
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-md p-6 bg-[#12121f] text-gray-100 rounded-3xl shadow-2xl border border-gray-800">
        <div className="flex flex-col items-center mb-6">
          <img
            src={logo}
            alt="Chatsapp Logo"
            className="w-20 h-20 mb-3 shadow-lg"
          />
          <h2 className="text-2xl font-bold">Welcome to Chatsapp</h2>
          <h1 className="text-xl font-semibold mt-1">
            {authMode === "login" ? "Login" : "Create Account"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === "login" ? (
            <>
              <LoginForm
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-[#ae7aff] text-black font-semibold py-3 rounded-lg transition 
                  ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-[#915adb]"}`}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </>
          ) : (
            <>
              <RegisterForm
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-[#ae7aff] text-black font-semibold py-3 rounded-lg transition 
                  ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-[#915adb]"}`}
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </>
          )}
        </form>

        <ToggleMode authMode={authMode} setAuthMode={switchMode} />
        <div className="mt-4 border-t border-gray-700 pt-4 text-center text-gray-400 text-sm">
          Or continue with
          <OAuthButtons />
        </div>
      </div>
    </div>
  );
}
