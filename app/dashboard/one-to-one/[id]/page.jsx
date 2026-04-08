"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import JitsiMeeting from "@/component/Jitsi";
import api from "@/app/lib/api";

const MeetingPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meetingStatus, setMeetingStatus] = useState("loading"); // "upcoming", "active", "ended"
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [error, setError] = useState(null);

  const jitsiApiRef = useRef(null);
  const timerRef = useRef(null);
  const endedRef = useRef(false);

  // Helper: format seconds to MM:SS
  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // End meeting: disable devices and go to dashboard
  const endMeeting = useCallback(async () => {
    if (endedRef.current) return;
    endedRef.current = true;

    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.executeCommand("toggleAudio");
        jitsiApiRef.current.executeCommand("toggleVideo");
        // Optionally dispose: jitsiApiRef.current.dispose();
      } catch (err) {
        console.error("Error disabling devices:", err);
      }
    }

    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  }, [router]);

  // Update timer based on current time and session times
  const updateTimer = useCallback(() => {
    if (!session) return;

    const now = new Date();
    const startTime = new Date(session.session_start);
    const endTime = new Date(session.session_end);

    if (now < startTime) {
      // Upcoming: show time until start
      setMeetingStatus("upcoming");
      const secondsUntilStart = Math.max(0, Math.floor((startTime - now) / 1000));
      setTimeLeftSeconds(secondsUntilStart);
    } else if (now >= startTime && now <= endTime) {
      // Active: show time remaining until end
      setMeetingStatus("active");
      const secondsRemaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeftSeconds(secondsRemaining);
      if (secondsRemaining <= 0) {
        // Meeting just ended
        endMeeting();
      }
    } else {
      // Ended
      setMeetingStatus("ended");
      setTimeLeftSeconds(0);
      if (!endedRef.current) {
        endMeeting();
      }
    }
  }, [session, endMeeting]);

  // Real‑time timer effect
  useEffect(() => {
    if (!session) return;

    // Update immediately
    updateTimer();

    // Then update every second
    timerRef.current = setInterval(() => {
      updateTimer();
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session, updateTimer]);

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/session/${id}`);
        const sessionData = res.data?.data || res.data;
        if (!sessionData || !sessionData._id) {
          throw new Error("Invalid session data");
        }
        setSession(sessionData);
      } catch (err) {
        console.error("Failed to fetch session:", err);
        setError("Unable to load meeting details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSession();
  }, [id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Loading meeting...
      </div>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white flex-col gap-4">
        <p>{error || "Meeting not found"}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-blue-600 rounded-lg"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Upcoming meeting (before start time)
  if (meetingStatus === "upcoming") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h1 className="text-3xl font-bold mb-4">Meeting starts in</h1>
        <div className="text-6xl font-mono mb-8">{formatTime(timeLeftSeconds)}</div>
        <p className="text-gray-400">Please wait, the meeting will begin automatically.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-8 px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700"
        >
          Leave
        </button>
      </div>
    );
  }

  // Ended meeting
  if (meetingStatus === "ended") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h1 className="text-3xl font-bold mb-4">Meeting Ended</h1>
        <p className="text-gray-400 mb-8">Thank you for joining.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Active meeting – show Jitsi with floating timer
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="h-screen w-full overflow-hidden bg-black relative">
      <div className="absolute top-4 right-4 z-50 bg-black/70 text-white px-4 py-2 rounded-full font-mono text-lg backdrop-blur-sm">
        ⏱️ {formattedTime}
      </div>

      <JitsiMeeting
        roomName={session.roomName}   // use the roomName from session data
        onApiReady={(api) => {
          jitsiApiRef.current = api;
        }}
      />
    </div>
  );
};

export default MeetingPage;