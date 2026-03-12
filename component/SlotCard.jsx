// components/SlotCard.jsx
"use client";

import { Clock, Lock, Loader2, Video, Timer, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

// ── Helpers ──────────────────────────────────────────────────────
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

// ── TimeBlock ─────────────────────────────────────────────────────
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

  // State styles
  const stateMap = {
    available: {
      dot: "bg-emerald-500",
      row: "hover:bg-gray-50 hover:border-gray-200 cursor-pointer",
    },
    pending: { dot: "bg-amber-400", row: "bg-amber-50/50" },
    accepted: { dot: "bg-blue-500", row: "bg-blue-50/40" },
    expired: { dot: "bg-gray-300", row: "opacity-50" },
  };
  const stateKey = isExpired
    ? "expired"
    : isAvailable
      ? "available"
      : isPending
        ? "pending"
        : "accepted";
  const st = stateMap[stateKey];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent transition-all duration-150 ${st.row}`}
      onClick={() => isAvailable && !isBookingThis && onBook(block.start_time)}
    >
      {/* Status dot */}
      <div className="relative flex-shrink-0 w-4 h-4 flex items-center justify-center">
        {isAvailable && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${st.dot} opacity-40 animate-ping`}
          />
        )}
        <span
          className={`relative inline-flex w-2 h-2 rounded-full ${st.dot}`}
        />
      </div>

      {/* Time */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span className="text-sm font-bold text-gray-900 tabular-nums font-mono">
          {fmt(block.start_time)}
        </span>
        <ChevronRight className="h-3 w-3 text-gray-300 flex-shrink-0" />
        <span className="text-sm font-bold text-gray-900 tabular-nums font-mono">
          {fmt(block.end_time)}
        </span>
        <span className="ml-1 text-[10px] font-semibold text-gray-300 uppercase tracking-wider">
          15m
        </span>
      </div>

      {/* Action badge */}
      <div className="flex-shrink-0">
        {isAvailable ? (
          isBookingThis ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin" /> Booking…
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-gray-900 text-white group-hover:bg-gray-700 transition-colors">
              Book <ChevronRight className="h-3 w-3" />
            </span>
          )
        ) : isExpired ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-400">
            <Clock className="h-3 w-3" /> Expired
          </span>
        ) : isPending ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
            <Clock className="h-3 w-3" /> Pending
          </span>
        ) : isAccepted && session ? (
          session.meeting_link && canJoin ? (
            <a
              href={session.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Video className="h-3 w-3" /> Join
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
              <Timer className="h-3 w-3" />{" "}
              {countdown ? `in ${countdown}` : "Ready"}
            </span>
          )
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-400">
            <Lock className="h-3 w-3" /> Booked
          </span>
        )}
      </div>
    </div>
  );
};

// ── SlotCard ──────────────────────────────────────────────────────
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
    return (
      new Date() <= expiryIso &&
      !slotSessions.find(
        (s) => new Date(s.requested_time).getTime() === blockIso.getTime(),
      )
    );
  }).length;

  const fmt12 = (t) => {
    if (!t) return "–";
    try {
      return new Date(`1970-01-01T${t}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return t;
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock className="h-3.5 w-3.5 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 font-mono tabular-nums">
              {fmt12(slot.start_time)} – {fmt12(slot.end_time)}
            </p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
              {duration} · {timeBlocks.length} blocks
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
            availCount > 0
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${availCount > 0 ? "bg-emerald-500" : "bg-gray-300"}`}
          />
          {availCount > 0 ? `${availCount} open` : "Full"}
        </span>
      </div>

      {/* Block list */}
      <div className="p-3 space-y-1">
        {timeBlocks.length === 0 ? (
          <p className="text-center py-6 text-xs text-gray-400 font-medium">
            No time blocks available
          </p>
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
