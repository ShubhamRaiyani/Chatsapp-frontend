import React, { useState, useEffect } from "react";
import { Maximize2, X } from "lucide-react";

const FullscreenPrompt = () => {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [dismissed, setDismissed] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const nowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(nowFullscreen);
      if (!nowFullscreen) setDismissed(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const enter = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      setUnsupported(true);
    }
  };

  if (isFullscreen || dismissed || unsupported) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2
      px-4 py-2.5 bg-[#1c1c2e]/95 backdrop-blur-md border border-white/[0.1]
      rounded-full shadow-xl shadow-black/40 text-sm text-gray-300 select-none">
      <button
        onClick={enter}
        className="flex items-center gap-2 hover:text-white transition-colors"
      >
        <Maximize2 size={14} className="text-blue-400" />
        <span>Tap for full screen</span>
      </button>
      <div className="w-px h-4 bg-white/10" />
      <button
        onClick={() => setDismissed(true)}
        className="text-gray-500 hover:text-gray-300 transition-colors"
        aria-label="Dismiss"
      >
        <X size={13} />
      </button>
    </div>
  );
};

export default FullscreenPrompt;
