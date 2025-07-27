import React from "react";

export default function RegisterForm({ formData, handleChange }) {
  return (
    <>
      <label className="flex flex-col">
        Username
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="px-3 py-2 rounded bg-black border border-gray-600 text-white"
          placeholder="Choose a username"
          required
        />
      </label>

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
        Password
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
