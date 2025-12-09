// chat/components/NavigationSidebar.jsx
import React, { useState } from "react";
import Avatar from "./ui/Avatar";
import ProfileSettingsModal from "./ProfileSettingsModal";

const NavigationSidebar = ({
  activeSection,
  onSectionChange,
  user,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const navigationItems = [
    {
      id: "chats",
      label: "All Chats",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      count: 0,
    },
    {
      id: "direct",
      label: "Direct Messages",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      count: 3,
    },
    {
      id: "groups",
      label: "Group Chats",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      count: 2,
    },
  ];

  return (
    <>
      <div className="w-16 bg-[#1A1A1A] border-r border-[#262626] flex flex-col">
        {/* Navigation Items */}
        <div className="flex-1 py-4">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`relative w-full p-3 mb-2 mx-2 rounded-xl transition-all duration-200 group ${
                activeSection === item.id
                  ? "bg-[#7C3AED] text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-[#262626]"
              }`}
              title={item.label}
            >
              <div className="flex items-center justify-center">{item.icon}</div>

              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-3 py-2 bg-[#262626] text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                {item.label}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#262626] rotate-45"></div>
              </div>
            </button>
          ))}
        </div>

        {/* Settings and User Menu */}
        <div className="p-2 border-t border-[#262626]">
          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full p-2 rounded-xl hover:bg-[#262626] transition-colors"
            >
              <Avatar
                src={user?.avatar}
                alt={user?.name || "User"}
                size="md"
                status="online"
                className="mx-auto"
              />
            </button>

            {/* User Menu */}
            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />

                {/* Menu */}
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#262626] rounded-xl shadow-2xl py-2 z-50 border border-[#404040]">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-[#404040]">
                    <div className="flex items-center space-x-3">
                      <Avatar
                        src={user?.avatar}
                        alt={user?.name || "User"}
                        size="md"
                        status="online"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowProfileModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#404040] transition-colors flex items-center space-x-3"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>Profile & Settings</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-[#404040] pt-2">
                    <button
                      onClick={() => {
                        onLogout?.();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#404040] transition-colors flex items-center space-x-3"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showProfileModal && (
        <ProfileSettingsModal 
          user={user} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}
    </>
  );
};

export default NavigationSidebar;
