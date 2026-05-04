"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import JitsiMeeting from "@/component/Jitsi";
import api from "@/app/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Video, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

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
      setMeetingStatus("upcoming");
      const secondsUntilStart = Math.max(
        0,
        Math.floor((startTime - now) / 1000),
      );
      setTimeLeftSeconds(secondsUntilStart);
    } else if (now >= startTime && now <= endTime) {
      setMeetingStatus("active");
      const secondsRemaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeftSeconds(secondsRemaining);
      if (secondsRemaining <= 0) {
        endMeeting();
      }
    } else {
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
    updateTimer();
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
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-400 font-medium">
          Connecting to secure server...
        </p>
      </div>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Meeting Not Found</h2>
          <p className="text-slate-400 text-sm mb-8">
            {error || "This meeting link is invalid or has expired."}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Upcoming meeting (before start time)
  if (meetingStatus === "upcoming") {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
          <div
            className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
            <Clock className="w-3.5 h-3.5" />
            Upcoming Session
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Starts in
          </h1>
          <div className="text-7xl md:text-8xl font-black font-mono mb-10 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
            {formatTime(timeLeftSeconds)}
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 mb-10 max-w-md mx-auto">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Meeting ID
                </p>
                <p className="text-lg font-bold truncate max-w-[200px]">
                  {session.roomName}
                </p>
              </div>
            </div>
          </div>

          <p className="text-slate-400 text-sm mb-8 font-medium">
            Please wait, you will be joined automatically.
          </p>

          <button
            onClick={() => router.push("/dashboard")}
            className="group inline-flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-rose-500 text-white rounded-xl font-bold transition-all border border-white/10 hover:border-rose-500"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Leave Room
          </button>
        </motion.div>
      </div>
    );
  }

  // Ended meeting
  if (meetingStatus === "ended") {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 max-w-sm"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black mb-3">Session Ended</h1>
          <p className="text-slate-400 text-sm mb-10">
            We hope you had a productive learning session!
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Active meeting – show Jitsi with floating timer
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="h-screen w-full overflow-hidden bg-black relative">
      <AnimatePresence>
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur-md text-white px-6 py-2 rounded-full font-mono text-lg border border-white/10 flex items-center gap-3 shadow-2xl"
        >
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          <span className="font-bold tracking-wider">{formattedTime}</span>
        </motion.div>
      </AnimatePresence>

      <JitsiMeeting
        roomName={session.roomName}
        onApiReady={(api) => {
          jitsiApiRef.current = api;
        }}
      />
    </div>
  );
};

export default MeetingPage;
