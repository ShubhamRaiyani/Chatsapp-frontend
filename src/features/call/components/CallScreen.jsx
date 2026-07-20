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
      {/* Remote video / audio area */}
      <div className="flex-1 relative flex items-center justify-center bg-gray-900">
        {isVideo ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
              {displayName[0]?.toUpperCase()}
            </div>
            <h2 className="text-white text-2xl font-semibold">{displayName}</h2>

            {isConnecting ? (
              <p className="text-gray-400 text-sm animate-pulse">Calling…</p>
            ) : (
              <p className="text-emerald-400 text-sm font-mono tracking-wider">
                {timer}
              </p>
            )}
          </div>
        )}

        {/* Timer overlay for video calls (top-center, like WhatsApp) */}
        {isVideo && isActive && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none">
            <span className="text-white text-sm font-semibold drop-shadow-lg">
              {displayName}
            </span>
            <span className="text-emerald-400 text-xs font-mono tracking-wider drop-shadow-lg">
              {timer}
            </span>
          </div>
        )}

        {/* Local video PiP */}
        {isVideo && (
          <div className="absolute bottom-6 right-6 w-32 h-44 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-gray-800">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Connecting overlay for video */}
        {isVideo && isConnecting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 gap-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
              {displayName[0]?.toUpperCase()}
            </div>
            <h2 className="text-white text-xl font-semibold">{displayName}</h2>
            <p className="text-gray-400 text-sm animate-pulse">Calling…</p>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="flex-shrink-0 bg-gray-900 border-t border-white/10 px-8 py-5 flex items-center justify-center gap-6">
        <button
          onClick={toggleMic}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${
            micEnabled
              ? "bg-white/10 hover:bg-white/20 text-white"
              : "bg-red-500/90 hover:bg-red-400 text-white"
          }`}
          title={micEnabled ? "Mute mic" : "Unmute mic"}
        >
          {micEnabled ? <Mic size={22} /> : <MicOff size={22} />}
        </button>

        <button
          onClick={endCall}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-red-500/40"
          title="End call"
        >
          <PhoneOff size={26} className="text-white" />
        </button>

        {isVideo && (
          <button
            onClick={toggleCamera}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              cameraEnabled
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-red-500/90 hover:bg-red-400 text-white"
            }`}
            title={cameraEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {cameraEnabled ? <Video size={22} /> : <VideoOff size={22} />}
          </button>
        )}
      </div>
    </div>
  );
}
