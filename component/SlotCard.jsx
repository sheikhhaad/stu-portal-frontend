// components/SlotCard.jsx
"use client";

import {
  Clock,
  Lock,
  Loader2,
  Video,
  Timer,
  CheckCircle,
  CircleDot,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";

// ── Format helpers ───────────────────────────────────────────────
const fmt = (timeStr) => {
  if (!timeStr) return "–";
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

const getCountdown = (sessionStart, now) => {
  if (!sessionStart) return null;
  const diff = new Date(sessionStart) - now;
  if (diff <= 0) return null;
  const total = Math.ceil(diff / 60000);
  if (total < 60) return `${total}m`;
  const h = Math.floor(total / 60),
    m = total % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

// ── Status config ───────────────────────────────────────────────
const STATUS = {
  available: {
    dot: "#22c55e",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    label: "Available",
    labelColor: "#15803d",
    pulse: true,
  },
  pending: {
    dot: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    label: "Pending",
    labelColor: "#b45309",
    pulse: false,
  },
  accepted: {
    dot: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    label: "Confirmed",
    labelColor: "#6d28d9",
    pulse: false,
  },
  expired: {
    dot: "#94a3b8",
    bg: "#f8fafc",
    border: "#e2e8f0",
    label: "Expired",
    labelColor: "#64748b",
    pulse: false,
  },
};

// ── Single time-block row ───────────────────────────────────────
const TimeBlock = ({ block, slot, session, bookingId, onBook }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const expiryIso = new Date(`${slot.date}T${block.end_time}`);
  const isExpired = now > expiryIso;

  const isPending = session?.status === "pending";
  const isAccepted = session?.status === "accepted";
  const isAvailable = !session && !isExpired;

  const currentBlockId = `${slot._id}-${block.start_time}`;
  const isBookingThis = bookingId === currentBlockId;

  const canJoin =
    isAccepted && session?.session_start
      ? new Date(session.session_start) <= now
      : false;
  const countdown = getCountdown(session?.session_start, now);

  const statusKey = isExpired
    ? "expired"
    : isAvailable
      ? "available"
      : isPending
        ? "pending"
        : "accepted";
  const s = STATUS[statusKey];

  return (
    <div
      className="group relative flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200"
      style={{
        background: s.bg,
        borderColor: isAvailable && !isBookingThis ? "transparent" : s.border,
        cursor: isAvailable && !isBookingThis ? "pointer" : "default",
        boxShadow: "none",
      }}
      onClick={() => isAvailable && !isBookingThis && onBook(block.start_time)}
      onMouseEnter={(e) => {
        if (isAvailable && !isBookingThis) {
          e.currentTarget.style.borderColor = s.border;
          e.currentTarget.style.boxShadow = `0 2px 12px ${s.dot}22`;
          e.currentTarget.style.transform = "translateX(2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (isAvailable && !isBookingThis) {
          e.currentTarget.style.borderColor = "transparent";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateX(0)";
        }
      }}
    >
      {/* Status dot */}
      <div className="relative flex-shrink-0 flex items-center justify-center w-5 h-5">
        {s.pulse && (
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{
              background: s.dot,
              animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
            }}
          />
        )}
        <span
          className="relative inline-flex rounded-full w-2.5 h-2.5"
          style={{ background: s.dot }}
        />
      </div>

      {/* Time range */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <span
          className="text-sm font-black tabular-nums"
          style={{ color: "#0f172a", fontFamily: "'DM Mono', monospace" }}
        >
          {fmt(block.start_time)}
        </span>
        <ChevronRight
          className="h-3 w-3 flex-shrink-0"
          style={{ color: "#94a3b8" }}
        />
        <span
          className="text-sm font-black tabular-nums"
          style={{ color: "#0f172a", fontFamily: "'DM Mono', monospace" }}
        >
          {fmt(block.end_time)}
        </span>
        <span
          className="ml-1 text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "#94a3b8" }}
        >
          15m
        </span>
      </div>

      {/* Right: status badge OR action */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {isAvailable ? (
          isBookingThis ? (
            <span
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl"
              style={{ background: "#ede9fe", color: "#7c3aed" }}
            >
              <Loader2 className="h-3 w-3 animate-spin" />
              Booking…
            </span>
          ) : (
            <span
              className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl transition-all duration-150 group-hover:scale-105"
              style={{ background: "#dcfce7", color: "#15803d" }}
            >
              Book
              <ChevronRight className="h-3 w-3" />
            </span>
          )
        ) : isExpired ? (
          <span
            className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl"
            style={{ background: "#f1f5f9", color: "#94a3b8" }}
          >
            <Clock className="h-3 w-3" />
            Expired
          </span>
        ) : isPending ? (
          <span
            className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl"
            style={{ background: "#fef3c7", color: "#b45309" }}
          >
            <Clock className="h-3 w-3" />
            Awaiting
          </span>
        ) : /* Accepted — show join or countdown */
        isAccepted && session ? (
          session.meeting_link && canJoin ? (
            <a
              href={session.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-xl transition-all hover:opacity-90"
              style={{ background: "#7c3aed", color: "#fff" }}
            >
              <Video className="h-3 w-3" />
              Join
            </a>
          ) : (
            <span
              className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl"
              style={{ background: "#ede9fe", color: "#7c3aed" }}
            >
              <Timer className="h-3 w-3" />
              {countdown ? `in ${countdown}` : "Ready"}
            </span>
          )
        ) : (
          <span
            className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl"
            style={{ background: "#f1f5f9", color: "#64748b" }}
          >
            <Lock className="h-3 w-3" />
            Booked
          </span>
        )}
      </div>
    </div>
  );
};

// ── Main SlotCard ───────────────────────────────────────────────
export const SlotCard = ({
  slot,
  timeBlocks = [],
  slotSessions = [],
  duration,
  bookingId = null,
  onBook,
}) => {
  const availCount = timeBlocks.filter((b) => {
    const blockIso = new Date(`${slot.date}T${b.start_time}`);
    const expiryIso = new Date(`${slot.date}T${b.end_time}`);
    const isPast = new Date() > expiryIso;

    return (
      !isPast &&
      !slotSessions.find(
        (s) => new Date(s.requested_time).getTime() === blockIso.getTime(),
      )
    );
  }).length;

  return (
    <div
      className="rounded-3xl border overflow-hidden"
      style={{
        background: "#ffffff",
        borderColor: "#e9e7e1",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>

      {/* Card header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "#f0ece4", background: "#fdfcfa" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#ede9fe" }}
          >
            <Clock className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <p
              className="text-sm font-black"
              style={{ color: "#0f172a", fontFamily: "'DM Mono', monospace" }}
            >
              {(() => {
                const fmt12 = (t) => {
                  if (!t) return "–";
                  try {
                    return new Date(`1970-01-01T${t}`).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      },
                    );
                  } catch {
                    return t;
                  }
                };
                return `${fmt12(slot.start_time)} – ${fmt12(slot.end_time)}`;
              })()}
            </p>
            <p
              className="text-[10px] font-bold uppercase tracking-widest mt-0.5"
              style={{ color: "#94a3b8" }}
            >
              {duration} window · {timeBlocks.length} blocks
            </p>
          </div>
        </div>

        {/* Available count badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black"
          style={{
            background: availCount > 0 ? "#dcfce7" : "#fee2e2",
            color: availCount > 0 ? "#15803d" : "#dc2626",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: availCount > 0 ? "#22c55e" : "#ef4444" }}
          />
          {availCount > 0 ? `${availCount} open` : "Full"}
        </div>
      </div>

      {/* Block list */}
      <div className="p-4 space-y-2">
        {timeBlocks.length === 0 ? (
          <div
            className="text-center py-6 text-sm font-semibold"
            style={{ color: "#94a3b8" }}
          >
            No time blocks available
          </div>
        ) : (
          timeBlocks.map((block, idx) => {
            const blockIso = new Date(
              `${slot.date}T${block.start_time}`,
            ).toISOString();
            const session = slotSessions.find(
              (s) => new Date(s.requested_time).toISOString() === blockIso,
            );
            return (
              <TimeBlock
                key={idx}
                block={block}
                slot={slot}
                session={session}
                bookingId={bookingId}
                onBook={onBook}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
