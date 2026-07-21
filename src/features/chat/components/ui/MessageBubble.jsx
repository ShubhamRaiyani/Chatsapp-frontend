import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Reply, Copy, Pencil, Trash2 } from "lucide-react";
import { formatMessageTime } from "../../utils/dateUtils";

const SWIPE_THRESHOLD = 60;
const SWIPE_MAX = 80;
const LONG_PRESS_DELAY = 500;

// ── Context menu ──────────────────────────────────────────────────────────────
const ContextMenu = ({ x, y, isOwn, onReply, onCopy, onEdit, onDelete, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const down = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) onClose(); };
    const key  = (e) => { if (e.key === "Escape") onClose(); };
    // slight delay so the same click that opened it doesn't immediately close it
    const tid = setTimeout(() => {
      document.addEventListener("mousedown", down);
      document.addEventListener("touchstart", down);
      document.addEventListener("keydown",    key);
    }, 50);
    return () => {
      clearTimeout(tid);
      document.removeEventListener("mousedown", down);
      document.removeEventListener("touchstart", down);
      document.removeEventListener("keydown",    key);
    };
  }, [onClose]);

  // Keep menu inside viewport
  const W = 180, H = isOwn ? 168 : 112;
  const px = Math.min(x, window.innerWidth  - W - 8);
  const py = Math.min(y, window.innerHeight - H - 8);

  const items = [
    { icon: Reply,  label: "Reply",  action: onReply },
    { icon: Copy,   label: "Copy",   action: onCopy  },
    ...(isOwn ? [
      { icon: Pencil, label: "Edit",   action: onEdit  },
      { icon: Trash2, label: "Delete", action: onDelete, danger: true },
    ] : []),
  ];

  return createPortal(
    <div
      ref={menuRef}
      style={{ left: px, top: py, minWidth: W }}
      className="fixed z-[9999] bg-[#1a1d2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden
                 animate-[fadeScaleIn_0.12s_ease-out]"
    >
      {items.map(({ icon: Icon, label, action, danger }, i) => (
        <button
          key={label}
          onMouseDown={(e) => { e.stopPropagation(); action?.(); onClose(); }}
          onTouchEnd={(e)  => { e.stopPropagation(); action?.(); onClose(); }}
          className={`
            w-full flex items-center gap-3 px-4 py-3 text-sm text-left select-none transition-colors
            ${danger
              ? "text-red-400 hover:bg-red-500/10 active:bg-red-500/20"
              : "text-gray-200 hover:bg-white/[0.07] active:bg-white/10"
            }
            ${i < items.length - 1 ? "border-b border-white/[0.05]" : ""}
          `}
        >
          <Icon size={15} className={danger ? "text-red-400" : "text-gray-400"} />
          {label}
        </button>
      ))}
    </div>,
    document.body
  );
};

// ── MessageBubble ─────────────────────────────────────────────────────────────
const MessageBubble = ({ message, isOwn, isGrouped = false, UsernameofChat, onReply, onEdit, onDelete }) => {
  const messageType = message.type || message.messageType;
  const isSummary   = messageType === "SUMMARY" || messageType === "Summary";
  const isImage     = messageType === "image"   || messageType === "IMAGE";

  const senderName = isOwn ? null : (message.senderUsername || message.senderName || UsernameofChat);
  const hasReply   = !!(message.replyToId || message.replyToContent);

  // ── Swipe state ────────────────────────────────────────
  const [swipeDx,   setSwipeDx]   = useState(0);
  const [swiping,   setSwiping]   = useState(false);
  const [triggered, setTriggered] = useState(false);
  const touchStartX    = useRef(null);
  const touchStartY    = useRef(null);
  const swipeLockedOut = useRef(false);
  const longPressTimer = useRef(null);
  const longPressFired = useRef(false);

  // ── Context menu state ─────────────────────────────────
  const [menu, setMenu] = useState(null); // { x, y }

  const openMenu = useCallback((x, y) => setMenu({ x, y }), []);
  const closeMenu = useCallback(() => setMenu(null), []);

  // ── Actions ────────────────────────────────────────────
  const handleCopy = () => {
    if (message.content) navigator.clipboard?.writeText(message.content);
  };

  // ── Right-click (desktop) ──────────────────────────────
  const handleContextMenu = (e) => {
    e.preventDefault();
    openMenu(e.clientX, e.clientY);
  };

  // ── Long-press (mobile) ────────────────────────────────
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStartX.current  = t.clientX;
    touchStartY.current  = t.clientY;
    swipeLockedOut.current = false;
    longPressFired.current = false;

    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      // Cancel any swipe in progress
      setSwipeDx(0);
      setSwiping(false);
      setTriggered(false);
      openMenu(t.clientX, t.clientY);
    }, LONG_PRESS_DELAY);
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;

    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // If the user is moving, cancel long-press
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      clearTimeout(longPressTimer.current);
    }

    // Lock to vertical scroll if mostly vertical
    if (!swiping && Math.abs(dy) > Math.abs(dx)) {
      swipeLockedOut.current = true;
    }
    if (swipeLockedOut.current || longPressFired.current) return;

    // Right swipe only
    if (dx > 0) {
      e.preventDefault();
      setSwiping(true);
      const clamped = Math.min(dx, SWIPE_MAX);
      setSwipeDx(clamped);
      setTriggered(clamped >= SWIPE_THRESHOLD);
    }
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimer.current);

    if (!longPressFired.current && triggered) {
      onReply?.(message);
    }

    setSwipeDx(0);
    setSwiping(false);
    setTriggered(false);
    touchStartX.current  = null;
    touchStartY.current  = null;
    swipeLockedOut.current = false;
  };

  const handleTouchCancel = () => {
    clearTimeout(longPressTimer.current);
    setSwipeDx(0);
    setSwiping(false);
    setTriggered(false);
  };

  // ── Swipe icon style ───────────────────────────────────
  const iconOpacity = Math.min(swipeDx / SWIPE_THRESHOLD, 1);
  const iconScale   = 0.6 + 0.4 * Math.min(swipeDx / SWIPE_THRESHOLD, 1);

  // ── Content renderer ───────────────────────────────────
  const renderContent = () => {
    switch (messageType) {
      case "text":
      case "TEXT":
      default:
        return <p className="text-[0.875rem] leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>;

      case "SUMMARY":
      case "Summary":
        return (
          <div>
            <div className="flex items-center gap-2 mb-2.5 pb-2.5 border-b border-white/20">
              <span className="text-xs font-bold text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded">AI</span>
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wide">Summary · Last 2 days</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-100">{message.content}</p>
          </div>
        );

      case "image":
      case "IMAGE":
        return (
          <img
            src={message.content || message.imageUrl}
            alt="Shared image"
            className="rounded-xl max-w-full h-auto max-h-80 object-cover block"
            loading="lazy"
          />
        );

      case "file":
      case "FILE":
        return (
          <div className="flex items-center gap-3 p-2 bg-white/10 rounded-xl">
            <div className="w-9 h-9 bg-blue-500/80 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">FILE</div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{message.fileName || "File"}</p>
              {message.fileSize && <p className="text-xs text-white/60">{message.fileSize}</p>}
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div
        className={`flex items-center ${isOwn ? "justify-end" : "justify-start"} ${isGrouped ? "mt-0.5" : "mt-3"} px-4 overflow-hidden select-none`}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        {/* Swipe reply icon */}
        <div
          className="flex-shrink-0 mr-1"
          style={{
            opacity:    iconOpacity,
            transform:  `scale(${iconScale})`,
            transition: swiping ? "none" : "opacity 0.2s, transform 0.2s",
            width: 28,
          }}
        >
          <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-100 ${triggered ? "bg-blue-500 text-white" : "bg-white/10 text-gray-400"}`}>
            <Reply size={14} />
          </div>
        </div>

        {/* Bubble wrapper — translates during swipe */}
        <div
          className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[72%] sm:max-w-[58%]`}
          style={{
            transform:  `translateX(${swipeDx}px)`,
            transition: swiping ? "none" : "transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        >
          {/* Sender name */}
          {!isOwn && !isGrouped && senderName && (
            <span className="text-[11px] font-semibold text-blue-400 mb-1 ml-1">{senderName}</span>
          )}

          {/* Bubble */}
          <div
            className={`
              relative px-3.5 py-2.5 shadow-sm
              ${isSummary
                ? "bg-gradient-to-br from-blue-600/90 to-indigo-700/90 rounded-2xl w-full max-w-none backdrop-blur-sm border border-white/10"
                : isOwn
                  ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                  : "bg-[#1e2130] text-gray-100 rounded-2xl rounded-tl-sm border border-white/5"
              }
              ${isImage ? "p-1 overflow-hidden" : ""}
            `}
          >
            {/* Quoted reply preview */}
            {hasReply && (
              <div className={`mb-2 px-2.5 py-1.5 rounded-lg border-l-2 ${isOwn ? "bg-white/10 border-white/60" : "bg-white/5 border-blue-400"}`}>
                <p className={`text-[11px] font-semibold mb-0.5 ${isOwn ? "text-white/80" : "text-blue-400"}`}>
                  {message.replyToSenderEmail || "Unknown"}
                </p>
                <p className="text-[12px] text-white/60 truncate max-w-[220px]">
                  {message.replyToContent || "Message"}
                </p>
              </div>
            )}

            <div className={isImage ? "" : "mb-1"}>{renderContent()}</div>

            {/* Timestamp + edited */}
            <div className={`flex items-center justify-end gap-1 mt-1 ${isImage ? "absolute bottom-2 right-2 bg-black/50 px-2 py-0.5 rounded-full" : ""}`}>
              {message.edited && (
                <span className={`text-[10px] leading-none italic ${isOwn ? "text-white/40" : "text-gray-600"}`}>edited</span>
              )}
              <span className={`text-[10px] leading-none ${isSummary ? "text-blue-200/70" : isImage ? "text-white" : isOwn ? "text-white/60" : "text-gray-500"}`}>
                {formatMessageTime(message.sentAt || message.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Context menu portal */}
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          isOwn={isOwn}
          onReply={() => onReply?.(message)}
          onCopy={handleCopy}
          onEdit={() => onEdit?.(message)}
          onDelete={() => onDelete?.(message)}
          onClose={closeMenu}
        />
      )}
    </>
  );
};

export default MessageBubble;
