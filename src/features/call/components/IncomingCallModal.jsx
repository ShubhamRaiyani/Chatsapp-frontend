import React, { useEffect, useRef } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useCallContext } from "../context/CallContext";

export default function IncomingCallModal() {
  const { phase, incomingSignal, callType, acceptCall, rejectCall } = useCallContext();
  const timerRef = useRef(null);

  useEffect(() => {
    if (phase !== "incoming") return;
    timerRef.current = setTimeout(() => rejectCall(), 30000);
    return () => clearTimeout(timerRef.current);
  }, [phase, rejectCall]);

  if (phase !== "incoming") return null;

  const callerName = incomingSignal?.fromEmail || "Unknown";
  const isVideo = callType === "VIDEO";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Card — bottom sheet on mobile, centered card on desktop */}
      <div className="
        w-full sm:w-auto sm:min-w-[340px] sm:max-w-sm
        bg-gray-900 border border-white/10
        rounded-t-3xl sm:rounded-3xl
        shadow-2xl
        px-6 pt-6 pb-10 sm:p-8
        flex flex-col items-center gap-5 sm:gap-6
        animate-slide-up sm:animate-none
      ">
        {/* Drag handle — mobile only */}
        <div className="w-10 h-1 rounded-full bg-white/20 mb-1 sm:hidden" />

        {/* Call type label */}
        <p className="text-gray-400 text-xs sm:text-sm tracking-wide uppercase">
          {isVideo ? "Incoming video call" : "Incoming voice call"}
        </p>

        {/* Pulsing avatar */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-emerald-500/25 animate-ping" />
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold relative z-10 shadow-lg">
            {callerName[0]?.toUpperCase()}
          </div>
        </div>

        {/* Caller name */}
        <h2 className="text-white text-lg sm:text-xl font-semibold text-center truncate max-w-[260px] sm:max-w-[280px]">
          {callerName}
        </h2>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-12 sm:gap-10 w-full mt-1">
          {/* Decline */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={rejectCall}
              className="w-16 h-16 sm:w-16 sm:h-16 rounded-full bg-red-500 hover:bg-red-400 active:bg-red-600 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-red-500/30"
            >
              <PhoneOff size={24} className="text-white" />
            </button>
            <span className="text-gray-400 text-xs">Decline</span>
          </div>

          {/* Accept */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={acceptCall}
              className="w-16 h-16 sm:w-16 sm:h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-emerald-500/30"
            >
              {isVideo ? (
                <Video size={24} className="text-white" />
              ) : (
                <Phone size={24} className="text-white" />
              )}
            </button>
            <span className="text-gray-400 text-xs">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
}
