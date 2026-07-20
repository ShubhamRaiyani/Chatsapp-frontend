import React, { useEffect, useRef } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useCallContext } from "../context/CallContext";

export default function IncomingCallModal() {
  const { phase, incomingSignal, callType, acceptCall, rejectCall } = useCallContext();
  const timerRef = useRef(null);

  // Auto-dismiss after 30 s (missed call)
  useEffect(() => {
    if (phase !== "incoming") return;
    timerRef.current = setTimeout(() => {
      rejectCall();
    }, 30000);
    return () => clearTimeout(timerRef.current);
  }, [phase, rejectCall]);

  if (phase !== "incoming") return null;

  const callerName = incomingSignal?.fromEmail || "Unknown";
  const isVideo = callType === "VIDEO";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6 w-80">
        {/* Pulsing avatar */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold relative z-10">
            {callerName[0]?.toUpperCase()}
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">
            {isVideo ? "Incoming video call" : "Incoming voice call"}
          </p>
          <h2 className="text-white text-xl font-semibold truncate max-w-[220px]">
            {callerName}
          </h2>
        </div>

        <div className="flex items-center gap-8">
          {/* Reject */}
          <button
            onClick={rejectCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-red-500/30"
          >
            <PhoneOff size={26} className="text-white" />
          </button>

          {/* Accept */}
          <button
            onClick={acceptCall}
            className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-emerald-500/30"
          >
            {isVideo ? (
              <Video size={26} className="text-white" />
            ) : (
              <Phone size={26} className="text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
