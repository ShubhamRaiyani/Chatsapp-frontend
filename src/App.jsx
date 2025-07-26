// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { useAuth } from "./contexts/AuthContext";
// import { AuthProvider } from "./contexts/AuthProvider";
import "./index.css"; // Ensure Tailwind CSS is imported
import AuthPage from "./pages/AuthPage";
// import ChatPage from "./components/chat/ChatPage"; // your chat page


export default function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          {/* <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          /> */}
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </BrowserRouter>
  );
}
