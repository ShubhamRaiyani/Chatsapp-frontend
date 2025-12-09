import React from "react";
import { Link } from "react-router-dom";

export default function LoginForm({ formData, handleChange }) {
  return (
    <>
      <label className="flex flex-col">
        Email
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="px-3 py-2 rounded bg-black border border-gray-600 text-white"
          placeholder="you@example.com"
          required
        />
      </label>
      <label className="flex flex-col">
        <div className="flex justify-between items-center mb-1">
          <span>Password</span>
          <Link to="/forgot-password" className="text-xs text-[#ae7aff] hover:underline">
            Forgot Password?
          </Link>
        </div>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="px-3 py-2 rounded bg-black border border-gray-600 text-white"
          placeholder="Your password"
          required
        />
      </label>
    </>
  );
}
