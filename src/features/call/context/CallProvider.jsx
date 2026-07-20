import React, { useState, useEffect, useRef, useCallback } from "react";
import CallContext from "./CallContext";
import callService from "../services/callService";
import webSocketService from "../../chat/services/WebSocketService";

// call phases: idle | outgoing | incoming | active
export function CallProvider({ children }) {
  const [phase, setPhase] = useState("idle");       // idle | outgoing | incoming | active
  const [callType, setCallType] = useState(null);   // AUDIO | VIDEO
  const [incomingSignal, setIncomingSignal] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeToEmail, setActiveToEmail] = useState(null);
  const [activeDisplayName, setActiveDisplayName] = useState(null);

  // Subscribe to call signals on every (re)connect — callService handles de-duplication
  useEffect(() => {
    const unsub = webSocketService.onConnectionChange((connected) => {
      if (connected) {
        callService.subscribeToCallSignals();
      } else {
        // Mark as unsubscribed so the next connect re-subscribes cleanly
        callService.unsubscribe();
      }
    });
    // Already connected when this mounts
    if (webSocketService.isConnected()) {
      callService.subscribeToCallSignals();
    }
    return unsub;
  }, []);

  // Listen to call events from callService
  useEffect(() => {
    const unsub = callService.onCallEvent((event) => {
      console.log("📞 Call event:", event.type, event);
      switch (event.type) {
        case "outgoing":
          setPhase("outgoing");
          setCallType(event.callType);
          setActiveChatId(event.chatId);
          setActiveToEmail(event.toEmail);
          setLocalStream(event.localStream);
          break;

        case "incoming":
          setPhase("incoming");
          setCallType(event.signal.callType);
          setIncomingSignal(event.signal);
          break;

        case "accepted":
          setPhase("active");
          setLocalStream(event.localStream);
          break;

        case "remote-stream":
          setRemoteStream(event.remoteStream);
          break;

        case "rejected":
          _resetState();
          break;

        case "ended":
          _resetState();
          break;

        case "error":
          console.error("Call error:", event.message);
          _resetState();
          break;

        default:
          break;
      }
    });
    return unsub;
  }, []);

  function _resetState() {
    setPhase("idle");
    setCallType(null);
    setIncomingSignal(null);
    setLocalStream(null);
    setRemoteStream(null);
    setMicEnabled(true);
    setCameraEnabled(true);
    setActiveChatId(null);
    setActiveToEmail(null);
    setActiveDisplayName(null);
  }

  const startCall = useCallback((chatId, toEmail, type, displayName) => {
    setActiveDisplayName(displayName || toEmail);
    callService.startCall(chatId, toEmail, type);
  }, []);

  const acceptCall = useCallback(async () => {
    if (!incomingSignal) return;
    setActiveChatId(incomingSignal.chatId);
    setActiveToEmail(incomingSignal.fromEmail);
    await callService.acceptCall(incomingSignal);
    setPhase("active");
  }, [incomingSignal]);

  const rejectCall = useCallback(() => {
    if (!incomingSignal) return;
    callService.rejectCall(incomingSignal);
    _resetState();
  }, [incomingSignal]);

  const endCall = useCallback(() => {
    callService.endCall();
    _resetState();
  }, []);

  const toggleMic = useCallback(() => {
    const enabled = callService.toggleMic();
    if (enabled !== undefined) setMicEnabled(enabled);
  }, []);

  const toggleCamera = useCallback(() => {
    const enabled = callService.toggleCamera();
    if (enabled !== undefined) setCameraEnabled(enabled);
  }, []);

  return (
    <CallContext.Provider value={{
      phase,
      callType,
      incomingSignal,
      localStream,
      remoteStream,
      micEnabled,
      cameraEnabled,
      activeChatId,
      activeToEmail,
      activeDisplayName,
      startCall,
      acceptCall,
      rejectCall,
      endCall,
      toggleMic,
      toggleCamera,
    }}>
      {children}
    </CallContext.Provider>
  );
}
