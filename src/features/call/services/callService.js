// features/call/services/callService.js
import webSocketService from "../../chat/services/WebSocketService";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    // Free public TURN — required for cross-network calls (mobile ↔ WiFi)
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

class CallService {
  constructor() {
    this.pc = null;              // RTCPeerConnection
    this.localStream = null;
    this.remoteStream = null;
    this.activeCall = null;      // { chatId, toEmail, callType }
    this.callCallbacks = new Set();

    // Route signals from WebSocketService into this service.
    // The subscription itself is owned by WebSocketService.onConnect.
    webSocketService.onCallSignal((signal) => this._handleSignal(signal));
  }

  // ─── Outgoing call ───────────────────────────────────────────────────────

  async startCall(chatId, toEmail, callType = "AUDIO") {
    if (!toEmail) {
      console.error("startCall: toEmail is required");
      return;
    }
    if (this.activeCall) {
      console.warn("Already in a call");
      return;
    }
    this.activeCall = { chatId, toEmail, callType };

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "VIDEO",
      });

      this._createPeerConnection(toEmail, chatId, callType);
      this.localStream.getTracks().forEach((t) => this.pc.addTrack(t, this.localStream));

      this._emit({ type: "outgoing", callType, toEmail, chatId, localStream: this.localStream });

      this._sendSignal({ type: "call-request", toEmail, chatId, callType });
    } catch (err) {
      console.error("startCall error:", err);
      this._cleanupCall();
      this._emit({ type: "error", message: err.message });
    }
  }

  // Called by caller after receiver accepts
  async _sendOffer() {
    if (!this.pc || !this.activeCall) return;
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this._sendSignal({
      type: "offer",
      toEmail: this.activeCall.toEmail,
      chatId: this.activeCall.chatId,
      sdp: offer.sdp,
      sdpType: offer.type,
    });
  }

  // ─── Incoming call ───────────────────────────────────────────────────────

  async acceptCall(signal) {
    this.activeCall = { chatId: signal.chatId, toEmail: signal.fromEmail, callType: signal.callType };

    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: signal.callType === "VIDEO",
    });

    this._createPeerConnection(signal.fromEmail, signal.chatId, signal.callType);
    this.localStream.getTracks().forEach((t) => this.pc.addTrack(t, this.localStream));

    // Tell caller we accepted — caller will then send the offer
    this._sendSignal({ type: "call-accepted", toEmail: signal.fromEmail, chatId: signal.chatId });
    this._emit({ type: "accepted", callType: signal.callType, localStream: this.localStream });
  }

  rejectCall(signal) {
    this._sendSignal({ type: "call-rejected", toEmail: signal.fromEmail, chatId: signal.chatId });
  }

  endCall() {
    if (!this.activeCall) return;
    this._sendSignal({ type: "call-ended", toEmail: this.activeCall.toEmail, chatId: this.activeCall.chatId });
    this._cleanupCall();
    this._emit({ type: "ended" });
  }

  toggleMic() {
    if (!this.localStream) return;
    const track = this.localStream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      return track.enabled;
    }
  }

  toggleCamera() {
    if (!this.localStream) return;
    const track = this.localStream.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      return track.enabled;
    }
  }

  // ─── Signal handler ───────────────────────────────────────────────────────

  async _handleSignal(signal) {
    console.log("📡 Call signal received:", signal.type, signal);

    switch (signal.type) {
      case "call-request":
        this._emit({ type: "incoming", signal });
        break;

      case "call-accepted":
        // Receiver accepted → send the WebRTC offer now
        await this._sendOffer();
        break;

      case "call-rejected":
        this._cleanupCall();
        this._emit({ type: "rejected" });
        break;

      case "call-ended":
        this._cleanupCall();
        this._emit({ type: "ended" });
        break;

      case "offer":
        await this._handleOffer(signal);
        break;

      case "answer":
        await this._handleAnswer(signal);
        break;

      case "ice-candidate":
        await this._handleIceCandidate(signal);
        break;

      default:
        console.warn("Unknown call signal:", signal.type);
    }
  }

  async _handleOffer(signal) {
    if (!this.pc) return;
    await this.pc.setRemoteDescription({ type: signal.sdpType, sdp: signal.sdp });
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    this._sendSignal({
      type: "answer",
      toEmail: signal.fromEmail,
      chatId: signal.chatId,
      sdp: answer.sdp,
      sdpType: answer.type,
    });
  }

  async _handleAnswer(signal) {
    if (!this.pc) return;
    await this.pc.setRemoteDescription({ type: signal.sdpType, sdp: signal.sdp });
  }

  async _handleIceCandidate(signal) {
    if (!this.pc) return;
    try {
      await this.pc.addIceCandidate({
        candidate: signal.candidate,
        sdpMid: signal.sdpMid,
        sdpMLineIndex: signal.sdpMLineIndex,
      });
    } catch (e) {
      console.warn("ICE candidate error:", e);
    }
  }

  // ─── RTCPeerConnection ────────────────────────────────────────────────────

  _createPeerConnection(toEmail, chatId, callType) {
    this.pc = new RTCPeerConnection(ICE_SERVERS);

    this.pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        this._sendSignal({
          type: "ice-candidate",
          toEmail,
          chatId,
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid,
          sdpMLineIndex: candidate.sdpMLineIndex,
        });
      }
    };

    this.remoteStream = new MediaStream();
    this.pc.ontrack = ({ track }) => {
      this.remoteStream.addTrack(track);
      this._emit({ type: "remote-stream", remoteStream: this.remoteStream });
    };

    this.pc.onconnectionstatechange = () => {
      console.log("PC state:", this.pc.connectionState);
      if (["failed", "disconnected", "closed"].includes(this.pc.connectionState)) {
        this._cleanupCall();
        this._emit({ type: "ended" });
      }
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  _sendSignal(data) {
    if (!webSocketService.isConnected()) {
      console.error("Cannot send call signal: WS not connected");
      return;
    }
    webSocketService.stompClient.publish({
      destination: "/app/call.signal",
      body: JSON.stringify(data),
    });
  }

  _cleanupCall() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    if (this.pc) {
      try { this.pc.close(); } catch (_) {}
      this.pc = null;
    }
    this.remoteStream = null;
    this.activeCall = null;
  }

  onCallEvent(callback) {
    this.callCallbacks.add(callback);
    return () => this.callCallbacks.delete(callback);
  }

  _emit(event) {
    this.callCallbacks.forEach((cb) => {
      try { cb(event); } catch (e) { console.error("Call callback error:", e); }
    });
  }

  isInCall() {
    return !!this.activeCall;
  }
}

const callService = new CallService();
export default callService;
