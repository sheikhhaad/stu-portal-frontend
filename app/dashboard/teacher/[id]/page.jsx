"use client";

import { useStudent } from "@/app/context/StudentContext";
import api from "@/app/lib/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Calendar,
  Clock,
  GraduationCap,
  CalendarDays,
  User,
  MapPin,
  AlertCircle,
  ArrowLeft,
  Video,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { SlotCard } from "@/component/SlotCard";
import { motion, AnimatePresence } from "framer-motion";
import { socket } from "@/app/lib/socket";

// ── Helpers ──
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      short: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      isToday: new Date().toDateString() === date.toDateString(),
      isTomorrow:
        new Date(Date.now() + 86400000).toDateString() === date.toDateString(),
    };
  } catch {
    return {
      full: dateString,
      short: dateString,
      isToday: false,
      isTomorrow: false,
    };
  }
};

const groupSlotsByDate = (slots) =>
  slots.reduce((groups, slot) => {
    const key = new Date(slot.date).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(slot);
    return groups;
  }, {});

const getDuration = (start, end) => {
  if (!start || !end) return "—";
  const s = new Date(`1970-01-01T${start}`);
  const e = new Date(`1970-01-01T${end}`);
  const diff = (e - s) / 60000;
  if (diff < 60) return `${diff} min`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

const generateTimeBlocks = (slot) => {
  if (!slot.start_time || !slot.end_time) return [];
  const blocks = [];
  const start = new Date(`1970-01-01T${slot.start_time}`);
  const end = new Date(`1970-01-01T${slot.end_time}`);
  let current = start;
  while (current < end) {
    const next = new Date(current.getTime() + 15 * 60000);
    if (next > end) break;
    blocks.push({
      start_time: current.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      end_time: next.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    current = next;
  }
  return blocks;
};

// ── Component ──
export default function TeacherDetail() {
  const { id: teacherId } = useParams();
  const router = useRouter();
  const { student } = useStudent();

  const [slots, setSlots] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [collapsedDates, setCollapsedDates] = useState({});
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchSlots = useCallback(async () => {
    if (!teacherId) return;
    try {
      setLoading(true);
      const res = await api.get(`/availability/${teacherId}`);
      if (isMounted.current) setSlots(res.data || []);
    } catch (err) {
      if (isMounted.current) setError("Failed to load availability slots.");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [teacherId]);

  const fetchSessions = useCallback(async () => {
    if (!teacherId || !student?._id) return;
    try {
      const res = await api.get(`/session/student/${student._id}`);
      const raw = res.data;
      const normalised = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.sessions)
          ? raw.sessions
          : raw?._id
            ? [raw]
            : [];
      if (isMounted.current) setSessions(normalised);
    } catch (err) {
      if (isMounted.current) setSessions([]);
    }
  }, [teacherId, student?._id]);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchSlots(), fetchSessions()]);
    setRefreshing(false);
  }, [fetchSlots, fetchSessions]);

  useEffect(() => {
    if (teacherId) {
      fetchSlots();
      if (student?._id) fetchSessions();
    }
  }, [teacherId, student?._id, fetchSlots, fetchSessions]);

  // Socket listeners
  useEffect(() => {
    if (!teacherId || !student?._id) return;
    if (!socket.connected) socket.connect();

    const handleSessionBooked = (session) => {
      if (
        session.teacher_id === teacherId &&
        session.student_id === student._id
      ) {
        setSessions((prev) =>
          prev.find((s) => s._id === session._id) ? prev : [...prev, session],
        );
        setSlots((prev) =>
          prev.map((s) =>
            s._id === session.slot_id
              ? { ...s, is_booked: true, booked_by: student._id }
              : s,
          ),
        );
      }
    };
    const handleSessionUpdated = (session) => {
      if (
        session.teacher_id === teacherId &&
        session.student_id === student._id
      ) {
        setSessions((prev) =>
          prev.map((s) => (s._id === session._id ? session : s)),
        );
      }
    };
    const handleSessionDeleted = ({ id }) =>
      setSessions((prev) => prev.filter((s) => s._id !== id));
    const handleSlotDeleted = ({ slotId }) =>
      setSlots((prev) => prev.filter((s) => s._id !== slotId));

    socket.on("session_booked", handleSessionBooked);
    socket.on("session_updated", handleSessionUpdated);
    socket.on("session_deleted", handleSessionDeleted);
    socket.on("slot_deleted", handleSlotDeleted);

    return () => {
      socket.off("session_booked", handleSessionBooked);
      socket.off("session_updated", handleSessionUpdated);
      socket.off("session_deleted", handleSessionDeleted);
      socket.off("slot_deleted", handleSlotDeleted);
    };
  }, [teacherId, student?._id]);

  const getSessionsForSlot = (slotId) =>
    sessions.filter((s) => s.slot_id === slotId);

  const bookSlot = async (slotId, slot, blockStartTime) => {
    if (!student) return alert("Please login to book a slot");
    const blockId = `${slotId}-${blockStartTime}`;
    setBookingId(blockId);

    // Optimistic update
    const optimisticSession = {
      _id: `opt_${Date.now()}`,
      slot_id: slotId,
      student_id: student._id,
      teacher_id: teacherId,
      status: "pending",
      requested_time: new Date(`${slot.date}T${blockStartTime}`).toISOString(),
      _isOptimistic: true,
    };
    setSessions((prev) => [...prev, optimisticSession]);
    setSlots((prev) =>
      prev.map((s) =>
        s._id === slotId
          ? { ...s, is_booked: true, booked_by: student._id }
          : s,
      ),
    );

    try {
      const requestedTimeIso = new Date(
        `${slot.date}T${blockStartTime}`,
      ).toISOString();
      const res = await api.put(`/session/book/${slotId}`, {
        student_id: student._id,
        teacher_id: teacherId,
        duration: 15,
        requested_time: requestedTimeIso,
      });
      const newSession = res.data?.session;
      const updatedSlot = res.data?.slot;
      setSessions((prev) =>
        prev.map((s) => (s._id === optimisticSession._id ? newSession : s)),
      );
      if (updatedSlot)
        setSlots((prev) =>
          prev.map((s) => (s._id === slotId ? updatedSlot : s)),
        );
    } catch (err) {
      // Rollback
      setSessions((prev) =>
        prev.filter((s) => s._id !== optimisticSession._id),
      );
      setSlots((prev) =>
        prev.map((s) =>
          s._id === slotId ? { ...s, is_booked: false, booked_by: null } : s,
        ),
      );
      alert(err.response?.data?.message || "Failed to book slot.");
    } finally {
      setBookingId(null);
    }
  };

  const toggleDateCollapse = (dateKey) =>
    setCollapsedDates((prev) => ({ ...prev, [dateKey]: !prev[dateKey] }));

  const grouped = groupSlotsByDate(slots);
  const totalAvailable = slots.filter((s) => !s.is_booked).length;
  const totalBooked = slots.filter((s) => s.is_booked).length;
  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(a) - new Date(b),
  );

  if (loading && slots.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-medium">
            Loading availability...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm shadow-sm">
          <AlertCircle className="h-10 w-10 text-rose-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            Something went wrong
          </h3>
          <p className="text-slate-400 text-sm mb-5">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition"
            >
              <RefreshCw className="h-4 w-4 inline mr-1" /> Retry
            </button>
            <button
              onClick={() => router.back()}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 font-medium transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </Link>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium mb-4">
                  <Video className="h-3 w-3" />
                  1:1 Sessions
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  Available Sessions
                </h1>
                <p className="text-slate-500 text-sm mt-2">
                  Book a 15‑minute slot with your instructor
                </p>
              </div>
              <div className="flex gap-3">
                <div className="bg-slate-50 rounded-xl px-4 py-2 text-center min-w-[80px]">
                  <p className="text-xl font-bold text-slate-800">
                    {totalAvailable}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    Open
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl px-4 py-2 text-center min-w-[80px]">
                  <p className="text-xl font-bold text-slate-800">
                    {totalBooked}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    Booked
                  </p>
                </div>
              </div>
            </div>

            {/* Session details row */}
            <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    Teacher
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    ID: {teacherId?.slice(0, 8)}…
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    Duration
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    15 min per slot
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    Location
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    Virtual (Video Call)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slots Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-800">
              Available Time Slots
            </h2>
            <span className="ml-auto px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">
              {slots.length}
            </span>
          </div>

          <div className="p-5">
            {slots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <CalendarDays className="h-6 w-6 text-slate-300" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  No sessions available
                </h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  This teacher hasn't added any availability yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedDates.map((dateKey, idx) => {
                  const dateSlots = grouped[dateKey];
                  const d = formatDate(dateKey);
                  const availSlots = dateSlots.filter((s) => !s.is_booked);
                  const bookedSlots = dateSlots.filter((s) => s.is_booked);
                  const isCollapsed = collapsedDates[dateKey];

                  return (
                    <motion.div
                      key={dateKey}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border border-slate-100 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleDateCollapse(dateKey)}
                        className="w-full px-5 py-3 bg-white flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-slate-400" />
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-800 text-sm">
                                {d.full}
                              </span>
                              {d.isToday && (
                                <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                                  Today
                                </span>
                              )}
                              {d.isTomorrow && (
                                <span className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                  Tomorrow
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {availSlots.length} open · {bookedSlots.length}{" "}
                              booked
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {availSlots.length > 0 && (
                            <span className="hidden sm:inline-block text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                              {availSlots.length} available
                            </span>
                          )}
                          {isCollapsed ? (
                            <ChevronDown className="h-4 w-4 text-slate-300" />
                          ) : (
                            <ChevronUp className="h-4 w-4 text-slate-300" />
                          )}
                        </div>
                      </button>

                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-slate-100 bg-slate-50/30 p-4">
                              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                                {dateSlots.map((slot) => (
                                  <div
                                    key={slot._id}
                                    className="flex-shrink-0 w-72 snap-start"
                                  >
                                    <SlotCard
                                      slot={slot}
                                      timeBlocks={generateTimeBlocks(slot)}
                                      slotSessions={getSessionsForSlot(
                                        slot._id,
                                      )}
                                      duration={getDuration(
                                        slot.start_time,
                                        slot.end_time,
                                      )}
                                      bookingId={bookingId}
                                      onBook={(blockStartTime) =>
                                        bookSlot(slot._id, slot, blockStartTime)
                                      }
                                    />
                                  </div>
                                ))}
                              </div>
                              {dateSlots.length > 3 && (
                                <p className="text-[10px] text-slate-300 font-medium text-right mt-2 pr-1">
                                  Scroll for more →
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
