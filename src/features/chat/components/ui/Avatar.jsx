// chat/components/ui/Avatar.jsx - Dark Theme Redesign
import React from "react";

const Avatar = ({
  src,
  alt = "User",
  size = "md",
  status,
  className = "",
  onClick,
  showStatus = true,
  ...props
}) => {
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
    "2xl": "w-20 h-20",
  };

  const statusSizeClasses = {
    xs: "w-2 h-2",
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
    xl: "w-4 h-4",
    "2xl": "w-5 h-5",
  };

  const statusColors = {
    online: "bg-[#22C55E]",
    away: "bg-[#F59E0B]",
    busy: "bg-[#EF4444]",
    offline: "bg-[#6B7280]",
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const gradientColors = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-teal-500",
    "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-500",
    "from-indigo-500 to-purple-500",
  ];

  const getGradientColor = (name) => {
    if (!name) return gradientColors[0];
    const hash = name.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return gradientColors[Math.abs(hash) % gradientColors.length];
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onClick={onClick}
      {...props}
    >
      {/* Avatar Image/Initials */}
      <div
        className={`${
          sizeClasses[size]
        } rounded-full overflow-hidden border-2 border-[#262626] ${
          onClick
            ? "cursor-pointer hover:border-[#7C3AED] transition-colors"
            : ""
        }`}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}

        {/* Fallback Initials */}
        <div
          className={`w-full h-full bg-gradient-to-br ${getGradientColor(
            alt
          )} flex items-center justify-center text-white font-semibold ${
            src ? "hidden" : "flex"
          } ${
            size === "xs" || size === "sm"
              ? "text-xs"
              : size === "md"
              ? "text-sm"
              : size === "lg"
              ? "text-base"
              : "text-lg"
          }`}
          style={{ display: src ? "none" : "flex" }}
        >
          {getInitials(alt)}
        </div>
      </div>

      {/* Status Indicator */}
      {/* {showStatus && status && (
        <div
          className={`absolute bottom-0 right-0 ${statusSizeClasses[size]} ${
            statusColors[status] || statusColors.offline
          } rounded-full border-2 border-[#0F0F0F] ${
            status === "online" ? "animate-pulse" : ""
          }`}
        />
      )} */}

      {/* Online Pulse Effect */}
      {/* {showStatus && status === "online" && (
        <div
          className={`absolute bottom-0 right-0 ${statusSizeClasses[size]} bg-[#22C55E] rounded-full animate-ping opacity-75`}
        />
      )} */}
    </div>
  );
};

export default Avatar;
