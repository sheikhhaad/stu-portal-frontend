// components/SlotCard.jsx
"use client";

import {
  Clock,
  Lock,
  Loader2,
  CalendarCheck,
  Video,
  ExternalLink,
  Hash,
  Timer,
} from "lucide-react";
import { useEffect, useState } from "react";

export const SlotCard = ({
  slot,
  isBooked,
  duration,
  isBooking = false,
  onBook,
  session,
}) => {
  const [now, setNow] = useState(new Date());
  // console.log(now);

  // Auto-tick every 30s so the Join button unlocks automatically
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    try {
      const d = timeStr.includes("T")
        ? new Date(timeStr)
        : new Date(`1970-01-01T${timeStr}`);
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeStr;
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return iso;
    }
  };
  const getCountdown = () => {
    if (!session?.session_start) return null;
    const diff = new Date(session.session_start) - now;
    if (diff <= 0) return null;
    const total = Math.ceil(diff / 60000);
    if (total < 60) return `${total}m`;
    const h = Math.floor(total / 60),
      m = total % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  };

  const isMySession = !!session;
  
  // ✅ Link & Join button only active when session_start time has passed
  const canJoin =
    isMySession && session?.session_start
      ? new Date(session?.session_start) <= now
      : false;
  const countdown = getCountdown();

  return (
    <div
      className={`
      group relative rounded-2xl border overflow-hidden transition-all duration-300
      ${
        isMySession
          ? "border-indigo-200 bg-white shadow-md shadow-indigo-100/50"
          : isBooked
            ? "border-slate-100 bg-slate-50/50 shadow-sm"
            : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50"
      }
    `}
    >
      {/* Top accent line */}
      <div
        className={`h-1 w-full ${
          isMySession
            ? "bg-gradient-to-r from-indigo-500 to-purple-500"
            : isBooked
              ? "bg-gradient-to-r from-red-300 to-red-400"
              : "bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        }`}
      />

      <div className="p-5">
        {/* ── Status Badge ── */}
        <div className="mb-4">
          {isMySession ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-indigo-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_5px_2px_rgba(99,102,241,0.4)]" />
              Your Session
            </span>
          ) : isBooked ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-red-500 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              Booked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-600 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_2px_rgba(16,185,129,0.4)]" />
              Available
            </span>
          )}
        </div>

        {/* ── Time Row ── */}
        <div className="flex items-center gap-3.5 mb-4">
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border transition-all ${
              isMySession
                ? "border-indigo-200 bg-indigo-50"
                : isBooked
                  ? "border-slate-100 bg-slate-100"
                  : "border-blue-100 bg-blue-50 group-hover:border-blue-200 group-hover:bg-blue-100"
            }`}
          >
            <Clock
              className={`h-5 w-5 ${isMySession ? "text-indigo-600" : isBooked ? "text-slate-400" : "text-blue-500"}`}
            />
          </div>
          <div>
            <h3
              className={`text-base font-bold leading-tight ${isMySession ? "text-indigo-900" : isBooked ? "text-slate-400" : "text-slate-800"}`}
            >
              {formatTime(slot.start_time)} — {formatTime(slot.end_time)}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {duration}
            </p>
          </div>
        </div>

        {/* ── Session Info (only when student has booked THIS slot) ── */}
        {isMySession && (
          <div className="mb-4 rounded-xl border border-indigo-100 overflow-hidden">
            {/* Info header */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600">
              <Video className="h-3.5 w-3.5 text-white/80" />
              <span className="text-[11px] font-bold text-white uppercase tracking-widest">
                Zoom Session Info
              </span>
            </div>

            <div className="px-4 py-3 bg-white space-y-3">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Status
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold capitalize px-2.5 py-0.5 rounded-full border ${
                    session.status === "confirmed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${session.status === "confirmed" ? "bg-emerald-500" : "bg-amber-500"}`}
                  />
                  {session.status}
                </span>
              </div>

              {/* Meeting ID */}
              {session.meeting_id && (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Hash className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500 font-medium">
                      Meeting ID
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 tracking-wider select-all">
                    {session.meeting_id}
                  </span>
                </div>
              )}

              <div className="w-full h-px bg-slate-100" />

              {/* Meeting Link — locked or clickable based on time */}
              {session.meeting_link && (
                <>
                  {canJoin ? (
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full group/link"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Video className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                        <span className="text-xs font-semibold text-indigo-600 group-hover/link:text-indigo-800 truncate transition-colors">
                          {session.meeting_link.replace("https://", "")}
                        </span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-indigo-400 group-hover/link:text-indigo-600 flex-shrink-0 ml-2 transition-colors" />
                    </a>
                  ) : (
                    // 🔒 Greyed out — not yet time
                    <div className="flex items-center justify-between w-full cursor-not-allowed select-none opacity-50">
                      <div className="flex items-center gap-2 min-w-0">
                        <Lock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-xs font-semibold text-slate-400 truncate">
                          {session.meeting_link.replace("https://", "")}
                        </span>
                      </div>
                      <Lock className="h-3.5 w-3.5 text-slate-300 flex-shrink-0 ml-2" />
                    </div>
                  )}

                  {/* Countdown / Live notice */}
                  {canJoin ? (
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                      <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">
                        Session is live — join now!
                      </p>
                    </div>
                  ) : countdown ? (
                    <div className="flex items-center gap-2 pt-0.5">
                      <Timer className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                      <p className="text-[11px] text-amber-600 font-semibold">
                        Link unlocks in {countdown} ·{" "}
                        {formatDateTime(session.session_start)}
                      </p>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-slate-100 mb-4" />

        {/* ── Action Button ── */}
        {isMySession ? (
          canJoin ? (
            <a
              href={session.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-200/60 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <Video className="h-4 w-4" />
              Join Meeting
            </a>
          ) : (
            <div className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed select-none">
              <Lock className="h-4 w-4" />
              {countdown ? `Opens in ${countdown}` : "Scheduled"}
            </div>
          )
        ) : isBooked ? (
          <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-slate-400">
            <Lock className="h-3.5 w-3.5" />
            Unavailable
          </div>
        ) : (
          <button
            onClick={() => onBook(slot._id, slot)}
            disabled={isBooking}
            className="group/btn relative flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white overflow-hidden bg-blue-600 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500" />
            {isBooking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Booking...
              </>
            ) : (
              <>
                <CalendarCheck className="h-4 w-4" /> Book Slot
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
