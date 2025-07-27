import React from "react";

export default function Input({ label, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="font-medium text-sm text-gray-300">{label}</label>
      )}
      <input
        className={`rounded border border-gray-600 bg-black text-white px-3 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#ae7aff] ${className}`}
        {...props}
      />
    </div>
  );
}
