import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useCallContext } from "../context/CallContext";

function useCallTimer(active) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (active) {
      setSeconds(0);
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
      setSeconds(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [active]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function CallScreen() {
  const {
    phase,
    callType,
    localStream,
    remoteStream,
    micEnabled,
    cameraEnabled,
    activeDisplayName,
    activeToEmail,
    endCall,
    toggleMic,
    toggleCamera,
  } = useCallContext();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const isActive = phase === "active";
  const timer = useCallTimer(isActive);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (phase !== "outgoing" && phase !== "active") return null;

  const isVideo = callType === "VIDEO";
  const displayName = activeDisplayName || activeToEmail || "...";
  const isConnecting = phase === "outgoing";

  return (
    <div className="fixed inset-0 z-[90] bg-gray-950 flex flex-col">

      {/* ── Main area ── */}
      <div className="flex-1 relative flex items-center justify-center bg-gray-900 overflow-hidden">

        {isVideo ? (
          /* Remote video fills the screen */
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          /* Audio call centre card */
          <div className="flex flex-col items-center gap-3 sm:gap-4 px-6 text-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-2xl">
              {displayName[0]?.toUpperCase()}
            </div>

            <h2 className="text-white text-xl sm:text-2xl font-semibold mt-1 truncate max-w-[260px] sm:max-w-xs">
              {displayName}
            </h2>

            {isConnecting ? (
              <p className="text-gray-400 text-sm animate-pulse">Calling…</p>
            ) : (
              <p className="text-emerald-400 text-sm font-mono tracking-widest">
                {timer}
              </p>
            )}
          </div>
        )}

        {/* Timer + name overlay for active video calls (top-centre, like WhatsApp) */}
        {isVideo && isActive && (
          <div className="absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 pointer-events-none px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm">
            <span className="text-white text-xs sm:text-sm font-semibold drop-shadow">
              {displayName}
            </span>
            <span className="text-emerald-400 text-xs font-mono tracking-widest drop-shadow">
              {timer}
            </span>
          </div>
        )}

        {/* Connecting overlay for video */}
        {isVideo && isConnecting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 gap-4 px-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-xl">
              {displayName[0]?.toUpperCase()}
            </div>
            <h2 className="text-white text-xl sm:text-2xl font-semibold text-center">
              {displayName}
            </h2>
            <p className="text-gray-400 text-sm animate-pulse">Calling…</p>
          </div>
        )}

        {/* Local video PiP — smaller on mobile */}
        {isVideo && (
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-24 h-36 sm:w-32 sm:h-44 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-gray-800">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* ── Controls bar ── */}
      <div className="flex-shrink-0 bg-gray-900 border-t border-white/10 px-6 py-4 sm:py-5 safe-bottom">
        <div className="flex items-center justify-center gap-5 sm:gap-8">

          {/* Mic */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={toggleMic}
              className={`w-13 h-13 sm:w-14 sm:h-14 w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all active:scale-95 ${
                micEnabled
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-red-500/90 hover:bg-red-400 text-white"
              }`}
            >
              {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <span className="text-gray-500 text-[10px]">
              {micEnabled ? "Mute" : "Unmute"}
            </span>
          </div>

          {/* End call */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 active:bg-red-600 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-red-500/40"
            >
              <PhoneOff size={24} className="text-white" />
            </button>
            <span className="text-gray-500 text-[10px]">End</span>
          </div>

          {/* Camera (video only) */}
          {isVideo && (
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={toggleCamera}
                className={`w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all active:scale-95 ${
                  cameraEnabled
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-red-500/90 hover:bg-red-400 text-white"
                }`}
              >
                {cameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
              <span className="text-gray-500 text-[10px]">
                {cameraEnabled ? "Camera" : "No cam"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
