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
  timeBlocks = [],
  slotSessions = [],
  duration,
  bookingId = null,
  onBook,
}) => {
  const [now, setNow] = useState(new Date());

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

  const getCountdown = (sessionStart) => {
    if (!sessionStart) return null;
    const diff = new Date(sessionStart) - now;
    if (diff <= 0) return null;
    const total = Math.ceil(diff / 60000);
    if (total < 60) return `${total}m`;
    const h = Math.floor(total / 60),
      m = total % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:border-indigo-200 hover:shadow-md">
      {/* Top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-400 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-5">
        {/* ── Time Row ── */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 leading-tight">
              {formatTime(slot.start_time)} — {formatTime(slot.end_time)}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Available Block
            </p>
          </div>
        </div>

        {/* ── 15-Min Blocks Grid ── */}
        <div className="grid grid-cols-2 gap-3">
          {timeBlocks.map((block, idx) => {
            // Reconstruct block's local start time ISO from slot.date
            const blockIso = new Date(
              `${slot.date}T${block.start_time}`,
            ).toISOString();

            // Look for a session matching this exact requested block time
            const session = slotSessions.find(
              (s) => new Date(s.requested_time).toISOString() === blockIso,
            );

            const isPending = session?.status === "pending";
            const isAccepted = session?.status === "accepted";
            const isAvailable = !session;

            const currentBlockId = `${slot._id}-${block.start_time}`;
            const isBookingThisBlock = bookingId === currentBlockId;

            const canJoin =
              isAccepted && session?.session_start
                ? new Date(session.session_start) <= now
                : false;
            const countdown = getCountdown(session?.session_start);

            return (
              <div
                key={idx}
                className="col-span-1 rounded-xl flex flex-col h-full border border-transparent"
              >
                {/* Visual Card Wrapper for the block */}
                <div
                  className={`
                    relative p-3 rounded-xl border flex-grow flex flex-col justify-between transition-all duration-200
                    ${isAvailable ? "bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md hover:ring-2 hover:ring-indigo-50 cursor-pointer" : ""}
                    ${isPending ? "bg-amber-50 border-amber-200" : ""}
                    ${isAccepted ? "bg-slate-50 border-slate-200" : ""}
                  `}
                  onClick={() => {
                    if (isAvailable && !isBookingThisBlock) {
                      onBook(block.start_time);
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-slate-800">
                      {formatTime(block.start_time)}
                    </span>

                    {/* Status Dot/Icon */}
                    {isAvailable && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                    {isPending && <Clock className="h-4 w-4 text-amber-500" />}
                    {isAccepted && <Lock className="h-4 w-4 text-slate-400" />}
                  </div>

                  {/* Status Label & Actions */}
                  <div className="mt-auto pt-2">
                    {isAvailable ? (
                      isBookingThisBlock ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
                          <Loader2 className="h-3 w-3 animate-spin" />{" "}
                          Booking...
                        </div>
                      ) : (
                        <div className="text-[11px] font-semibold text-emerald-600 tracking-wide uppercase">
                          Available
                        </div>
                      )
                    ) : isPending ? (
                      <div className="text-[11px] font-semibold text-amber-600 leading-tight">
                        Waiting approval...
                      </div>
                    ) : (
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Booked
                      </div>
                    )}
                  </div>
                </div>

                {/* Zoom Info Panel for Accepted Blocks - Rendered below the block card */}
                {isAccepted && session && (
                  <div className="mt-2 text-left bg-indigo-50 rounded-lg p-2.5 border border-indigo-100/50 shadow-sm relative before:absolute before:-top-1.5 before:left-4 before:w-3 before:h-3 before:bg-indigo-50 before:border-t before:border-l before:border-indigo-100/50 before:rotate-45">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Video className="h-3 w-3 text-indigo-600" />
                      <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
                        Zoom
                      </span>
                    </div>

                    {session.meeting_link ? (
                      canJoin ? (
                        <a
                          href={session.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-md text-center transition-colors"
                        >
                          Join Meeting
                        </a>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-medium">
                          <Timer className="h-3 w-3" />
                          {countdown ? `Opens in ${countdown}` : "Ready"}
                        </div>
                      )
                    ) : (
                      <div className="text-[10px] text-slate-500 w-full truncate">
                        No link yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
