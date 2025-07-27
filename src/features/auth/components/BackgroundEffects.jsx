import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import Animation from "../../../assets/images/blue.json"; // Adjust the path to your animation file

export default function BackgroundEffect() {
  return (
    <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-none">
      <Player
        src={Animation}
        background="transparent"
        speed={1}
        style={{
          width: "100vw",
          height: "100vh",
          minWidth: "100vw",
          minHeight: "100vh",
        }}
        loop
        autoplay
      />
    </div>
  );
}

  
