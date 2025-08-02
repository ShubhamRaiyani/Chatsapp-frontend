import React, { useState, useEffect } from "react";
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

  const [loginMessage, setLoginMessage] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [blinkLogin, setBlinkLogin] = useState(false);
  const [blinkRegister, setBlinkRegister] = useState(false);

  // Blink effect for loginMessage
  useEffect(() => {
    if (loginMessage) {
      setBlinkLogin(true);
      const t = setTimeout(() => setBlinkLogin(false), 1000);
      return () => clearTimeout(t);
    }
  }, [loginMessage]);

  // Blink effect for registerMessage
  useEffect(() => {
    if (registerMessage) {
      setBlinkRegister(true);
      const t = setTimeout(() => setBlinkRegister(false), 1000);
      return () => clearTimeout(t);
    }
  }, [registerMessage]);

  const switchMode = (mode) => {
    setAuthMode(mode);
    setErrors({});
    setLoginMessage("");
    setRegisterMessage("");
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
    const result = await login(formData.email, formData.password);
    if (result.success) {
      const token = result.token || getCookieValue("jwt");
      if (token) localStorage.setItem("authToken", token);
      navigate("/dashboard");
    } else {
      setLoginMessage("Username or password is incorrect.");
    }
  };

  const handleRegister = async () => {
    const result = await register(
      formData.username,
      formData.email,
      formData.password
    );
    if (result.success) {
      setRegisterMessage("Registration successful! Please verify your email.");
      setFormData({ username: "", email: "", password: "" });
    } else {
      setRegisterMessage("Email already taken or already verified.");
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
            alt="MyApp Logo"
            className="w-20 h-20 mb-3 shadow-lg"
          />
          <h2 className="text-2xl font-bold">Welcome to MyApp</h2>
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
                className="w-full bg-[#ae7aff] text-black font-semibold py-3 rounded-lg hover:bg-[#915adb] transition"
              >
                Login
              </button>
              {loginMessage && (
                <p
                  className={
                    `mx-auto text-center text-[#ae7aff] font-semibold py-2 px-4 mt-4 rounded ` +
                    (blinkLogin ? "blink-animation" : "")
                  }
                >
                  {loginMessage}
                </p>
              )}
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
                className="w-full bg-[#ae7aff] text-black font-semibold py-3 rounded-lg hover:bg-[#915adb] transition"
              >
                Create Account
              </button>
              {registerMessage && (
                <p
                  className={
                    `mx-auto text-center text-[#ae7aff] font-semibold py-2 px-4 mt-4 rounded ` +
                    (blinkRegister ? "blink-animation" : "")
                  }
                >
                  {registerMessage}
                </p>
              )}
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
