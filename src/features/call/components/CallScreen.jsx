import React, { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX } from "lucide-react";
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
  if (h > 0)
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function CallScreen() {
  const {
    phase, callType, localStream, remoteStream,
    micEnabled, cameraEnabled, activeDisplayName, activeToEmail,
    endCall, toggleMic, toggleCamera,
  } = useCallContext();

  // videoA = main feed, videoB = pip feed
  const videoARef      = useRef(null);
  const videoBRef      = useRef(null);
  // Audio routing for voice calls
  const remoteAudioRef = useRef(null);   // <audio>  → earpiece / Android default
  const remoteSpeakRef = useRef(null);   // <video hidden> → loudspeaker (iOS trick)
  const hideTimerRef   = useRef(null);

  const isActive = phase === "active";
  const timer    = useCallTimer(isActive);

  const [controlsVisible, setControlsVisible] = useState(true);
  const [pipSwapped, setPipSwapped] = useState(false);
  const [swapping,   setSwapping]   = useState(false);   // brief fade during swap
  const [speakerOn,  setSpeakerOn]  = useState(true);

  // ── show/hide controls ────────────────────────────────────────────────────
  const showControls = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 4000);
  }, []);

  useEffect(() => {
    if (isActive && callType === "VIDEO") {
      hideTimerRef.current = setTimeout(() => setControlsVisible(false), 4000);
    } else {
      setControlsVisible(true);
    }
    return () => clearTimeout(hideTimerRef.current);
  }, [isActive, callType]);

  // ── attach video streams ──────────────────────────────────────────────────
  // videoA = remote (main) when not swapped, local (main) when swapped
  // videoB = local (pip)  when not swapped, remote (pip) when swapped
  useEffect(() => {
    const aStream = pipSwapped ? localStream  : remoteStream;
    const bStream = pipSwapped ? remoteStream : localStream;
    if (videoARef.current) videoARef.current.srcObject = aStream ?? null;
    if (videoBRef.current) videoBRef.current.srcObject = bStream ?? null;
  }, [localStream, remoteStream, pipSwapped]);

  // ── attach audio for voice calls ──────────────────────────────────────────
  useEffect(() => {
    if (callType === "VIDEO") return;
    if (speakerOn) {
      // Route through hidden <video> → iOS forces speaker output for video elements
      if (remoteSpeakRef.current) remoteSpeakRef.current.srcObject = remoteStream ?? null;
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    } else {
      // Route through <audio> → earpiece on iOS, default on Android/desktop
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream ?? null;
      if (remoteSpeakRef.current) remoteSpeakRef.current.srcObject = null;
    }
  }, [remoteStream, callType, speakerOn]);

  // ── speaker toggle ────────────────────────────────────────────────────────
  const toggleSpeaker = useCallback(async () => {
    const next = !speakerOn;
    setSpeakerOn(next);
    // Use setSinkId on browsers that support it (Chrome on Android / desktop)
    const target = next ? remoteSpeakRef.current : remoteAudioRef.current;
    if (target && "setSinkId" in target) {
      try {
        if (next) {
          // Speaker: default output (usually speakerphone)
          await target.setSinkId("");
        } else {
          // Earpiece: find the earpiece device if enumerated
          const devices = await navigator.mediaDevices.enumerateDevices();
          const ear = devices.find(
            (d) => d.kind === "audiooutput" && d.label.toLowerCase().includes("ear")
          );
          await target.setSinkId(ear?.deviceId || "");
        }
      } catch (_) {
        // setSinkId not available — iOS handles audio routing via element type
      }
    }
  }, [speakerOn]);

  // ── smooth PiP swap (cross-fade) ─────────────────────────────────────────
  const handleSwap = useCallback(
    (e) => {
      e.stopPropagation();
      if (swapping) return;
      setSwapping(true);
      showControls();
      setTimeout(() => {
        setPipSwapped((v) => !v);
        setTimeout(() => setSwapping(false), 50);
      }, 180);
    },
    [swapping, showControls]
  );

  if (phase !== "outgoing" && phase !== "active") return null;

  const isVideo      = callType === "VIDEO";
  const displayName  = activeDisplayName || activeToEmail || "...";
  const isConnecting = phase === "outgoing";

  return (
    <div
      className="fixed inset-0 z-[90] bg-gray-950 select-none overflow-hidden"
      onClick={isVideo && isActive ? showControls : undefined}
    >
      {/* ── Hidden audio elements for voice calls ───────────────────────── */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      {/* Hidden video element — used for speakerphone routing on iOS */}
      <video ref={remoteSpeakRef} autoPlay playsInline muted={false} className="hidden" />

      {/* ═══════════════════════════════════════════════════════════════════
          VIDEO CALL layout
          ═══════════════════════════════════════════════════════════════════ */}
      {isVideo && (
        <div className="absolute inset-0">
          {/* Main feed (video A) */}
          <video
            ref={videoARef}
            autoPlay
            playsInline
            muted={pipSwapped}   // muted when local is in main
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${swapping ? "opacity-0" : "opacity-100"}`}
          />

          {/* PiP feed (video B) — tap to swap */}
          <div
            className={`absolute bottom-[5.5rem] right-3 sm:bottom-24 sm:right-4
              w-[28vw] max-w-[120px] aspect-[9/16]
              rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl
              cursor-pointer z-10 active:scale-95
              transition-opacity duration-200 ${swapping ? "opacity-0" : "opacity-100"}`}
            onClick={handleSwap}
          >
            <video
              ref={videoBRef}
              autoPlay
              playsInline
              muted={!pipSwapped}   // muted when local is in pip
              className="w-full h-full object-cover"
            />
            {/* Swap hint on hover/long-press */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/25 active:bg-black/30 transition-colors flex items-center justify-center">
              <span className="opacity-0 hover:opacity-70 text-white text-[10px] font-medium transition-opacity">
                Swap
              </span>
            </div>
          </div>

          {/* Name + timer top overlay (fades with controls) */}
          {isActive && (
            <div
              className={`absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 z-20
                flex flex-col items-center gap-0.5 pointer-events-none
                px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-sm
                transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "opacity-0"}`}
            >
              <span className="text-white text-xs sm:text-sm font-semibold drop-shadow">{displayName}</span>
              <span className="text-emerald-400 text-[11px] font-mono tracking-widest drop-shadow">{timer}</span>
            </div>
          )}

          {/* Connecting overlay */}
          {isConnecting && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-900/90 gap-4 px-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-xl">
                {displayName[0]?.toUpperCase()}
              </div>
              <h2 className="text-white text-xl sm:text-2xl font-semibold text-center">{displayName}</h2>
              <p className="text-gray-400 text-sm animate-pulse">Calling…</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          AUDIO CALL layout
          ═══════════════════════════════════════════════════════════════════ */}
      {!isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="flex flex-col items-center gap-3 sm:gap-4 px-6 text-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-2xl">
              {displayName[0]?.toUpperCase()}
            </div>
            <h2 className="text-white text-xl sm:text-2xl font-semibold mt-1 truncate max-w-[260px] sm:max-w-xs">
              {displayName}
            </h2>
            {isConnecting
              ? <p className="text-gray-400 text-sm animate-pulse">Calling…</p>
              : <p className="text-emerald-400 text-sm font-mono tracking-widest">{timer}</p>
            }
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          CONTROLS BAR — absolutely positioned so it NEVER leaves a black bar.
          For video: gradient overlay that slides off screen when hidden.
          For audio: solid panel at bottom.
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30
          transition-transform duration-300 ease-in-out
          ${isVideo && isActive && !controlsVisible ? "translate-y-full" : "translate-y-0"}`}
      >
        <div
          className={`px-6 pb-10 sm:pb-8 pt-4 sm:pt-5
            ${isVideo
              ? "bg-gradient-to-t from-black/75 via-black/40 to-transparent"
              : "bg-gray-900 border-t border-white/10"
            }`}
        >
          <div className="flex items-center justify-center gap-6 sm:gap-10">

            {/* Mic */}
            <CtrlBtn
              icon={micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              label={micEnabled ? "Mute" : "Unmute"}
              active={!micEnabled}
              onClick={(e) => { e.stopPropagation(); toggleMic(); }}
            />

            {/* End call */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); endCall(); }}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 active:bg-red-600 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-red-500/40"
              >
                <PhoneOff size={24} className="text-white" />
              </button>
              <span className="text-white/60 text-[10px]">End</span>
            </div>

            {/* Camera — video calls only */}
            {isVideo && (
              <CtrlBtn
                icon={cameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                label={cameraEnabled ? "Camera" : "No cam"}
                active={!cameraEnabled}
                onClick={(e) => { e.stopPropagation(); toggleCamera(); }}
              />
            )}

            {/* Speaker — voice calls only */}
            {!isVideo && (
              <CtrlBtn
                icon={speakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                label={speakerOn ? "Speaker" : "Earpiece"}
                active={false}
                onClick={(e) => { e.stopPropagation(); toggleSpeaker(); }}
                highlight={speakerOn}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small reusable control button */
function CtrlBtn({ icon, label, active, onClick, highlight }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={onClick}
        className={`w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all active:scale-95 ${
          active
            ? "bg-red-500/90 hover:bg-red-400 text-white"
            : highlight
            ? "bg-emerald-500/80 hover:bg-emerald-400 text-white"
            : "bg-white/15 hover:bg-white/25 text-white"
        }`}
      >
        {icon}
      </button>
      <span className="text-white/60 text-[10px]">{label}</span>
    </div>
  );
}
