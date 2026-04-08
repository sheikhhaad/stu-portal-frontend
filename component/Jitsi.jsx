"use client";

import { useEffect, useRef } from "react";

const JitsiMeeting = ({ roomName }) => {
  const jitsiRef = useRef(null);

  useEffect(() => {
    if (!window.JitsiMeetExternalAPI || !jitsiRef.current) return;

    // Initialize Jitsi
    const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
      roomName,
      parentNode: jitsiRef.current,
      width: "100%",
      height: "100%",
      configOverwrite: {
        prejoinPageEnabled: false, // skip asking to join page
        enableWelcomePage: false,
        disableModeratorIndicator: true,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        HIDE_INVITE_MORE_HEADER: true,
      },
    });

    // Optional: auto-set user as moderator if you want
    // api.executeCommand('toggleLobby', true); // only if using Jitsi server with lobby

    return () => api.dispose(); // cleanup
  }, [roomName]);

  return (
    <div
      ref={jitsiRef}
      style={{
        width: "100%",
        height: "600px",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    />
  );
};

export default JitsiMeeting;
