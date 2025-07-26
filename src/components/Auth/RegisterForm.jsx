import React from "react";

export default function RegisterForm({ formData, handleChange }) {
  return (
    <>
      <div>
        <label className="text-sm block mb-1">Name</label>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Your full name"
          className="w-full p-2 rounded border border-white bg-black text-white placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="text-sm block mb-1">Email</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
          className="w-full p-2 rounded border border-white bg-black text-white placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="text-sm block mb-1">Password</label>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
          className="w-full p-2 rounded border border-white bg-black text-white placeholder:text-gray-400"
        />
      </div>
    </>
  );
}
