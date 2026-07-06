import React, { useState } from "react";
import Avatar from "./ui/Avatar";
import ProfileSettingsModal from "./ProfileSettingsModal";
import { MessageSquare, User, Users, LogOut, Settings } from "lucide-react";
import logo from "../../../assets/images/logo.png";

const NavigationSidebar = ({ activeSection, onSectionChange, user, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const navItems = [
    { id: "chats",  label: "Chats",   icon: MessageSquare },
    { id: "direct", label: "Direct",  icon: User          },
    { id: "groups", label: "Groups",  icon: Users         },
  ];

  return (
    <>
      <div className="w-full bg-[#111118] border-r border-white/5 flex flex-col items-center py-3 gap-1 h-full">
        {/* Logo mark */}
        <div className="md:w-10 md:h-10 w-9 h-9 mb-4 flex-shrink-0">
          <img src={logo} alt="Chatsapp" className="w-full h-full object-contain" />
        </div>

        {/* Nav items */}
        <div className="flex flex-col items-center gap-1 flex-1">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => onSectionChange(id)}
                title={label}
                className={`
                  relative group md:w-11 md:h-11 w-9 h-9 rounded-xl flex flex-col items-center justify-center
                  transition-all duration-150
                  ${isActive
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                  }
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-r-full" />
                )}
                <Icon size={18} className="md:hidden" strokeWidth={isActive ? 2.5 : 2} />
                <Icon size={20} className="hidden md:block" strokeWidth={isActive ? 2.5 : 2} />

                {/* Tooltip */}
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded-lg
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible whitespace-nowrap z-50
                  shadow-xl border border-white/10 pointer-events-none transition-all duration-150">
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* User avatar + menu — pinned to bottom */}
        <div className="relative flex flex-col items-center gap-2 mt-auto pt-2">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="md:w-9 md:h-9 w-8 h-8 rounded-xl overflow-hidden ring-2 ring-transparent hover:ring-blue-500/50 transition-all duration-150"
          >
            <Avatar src={user?.avatar} alt={user?.username || user?.name || "U"} size="sm" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute bottom-0 left-full ml-3 w-60 bg-[#1c1c28] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
                  <Avatar src={user?.avatar} alt={user?.username || user?.name || "U"} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user?.username || user?.name || "User"}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="py-1.5">
                  <button
                    onClick={() => { setShowProfileModal(true); setShowUserMenu(false); }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    <Settings size={15} className="text-gray-400" />
                    Profile & Settings
                  </button>
                </div>

                <div className="border-t border-white/5 py-1.5">
                  <button
                    onClick={() => { onLogout?.(); setShowUserMenu(false); }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-red-400 hover:bg-white/5 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showProfileModal && (
        <ProfileSettingsModal onClose={() => setShowProfileModal(false)} />
      )}
    </>
  );
};

export default NavigationSidebar;
