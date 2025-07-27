import React from "react";
import clsx from "clsx"; // install clsx or use classnames for dynamic classes

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const variantClasses = {
    primary: "bg-[#ae7aff] text-black hover:bg-[#915adb]",
    secondary: "bg-gray-700 text-white hover:bg-gray-600",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  const sizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={clsx(
        "rounded font-semibold transition-colors disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
