"use client";

import { useStudent } from "@/app/context/StudentContext";
import api from "@/app/lib/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { socket } from "@/app/lib/socket"; // ✅ import socket

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
const TeacherDetail = () => {
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

  // Fetch slots
  const fetchSlots = useCallback(async () => {
    if (!teacherId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/availability/${teacherId}`);
      if (isMounted.current) setSlots(res.data || []);
    } catch (err) {
      console.error("Error fetching slots:", err);
      if (isMounted.current) setError("Failed to load availability slots.");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [teacherId]);

  // Fetch sessions for this student
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
      console.error("Error fetching sessions:", err);
      if (isMounted.current) setSessions([]);
    }
  }, [teacherId, student?._id]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchSlots(), fetchSessions()]);
    setRefreshing(false);
  }, [fetchSlots, fetchSessions]);

  // Initial fetch
  useEffect(() => {
    if (teacherId) {
      fetchSlots();
      if (student?._id) fetchSessions();
    }
  }, [teacherId, student?._id, fetchSlots, fetchSessions]);

  // ✅ Real‑time socket listeners (matches backend events)
  useEffect(() => {
    if (!teacherId || !student?._id) return;
    if (!socket.connected) socket.connect();

    const handleSessionBooked = (session) => {
      if (
        session.teacher_id === teacherId &&
        session.student_id === student._id
      ) {
        setSessions((prev) => {
          if (prev.find((s) => s._id === session._id)) return prev;
          return [...prev, session];
        });
        // Update slot booked status
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

    const handleSessionDeleted = ({ id }) => {
      setSessions((prev) => prev.filter((s) => s._id !== id));
    };

    const handleSlotDeleted = ({ slotId }) => {
      setSlots((prev) => prev.filter((s) => s._id !== slotId));
    };

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
    if (!student) {
      alert("Please login to book a slot");
      return;
    }

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
      if (updatedSlot) {
        setSlots((prev) =>
          prev.map((s) => (s._id === slotId ? updatedSlot : s)),
        );
      }
    } catch (err) {
      console.error("Booking error:", err);
      // Rollback optimistic
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400 font-medium">
            Loading availability...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            Something went wrong
          </h3>
          <p className="text-gray-400 text-sm mb-5">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`.scrollbar-none::-webkit-scrollbar{display:none}.scrollbar-none{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header with refresh */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 font-semibold transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </button>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Page header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl px-7 py-8 mb-6 relative overflow-hidden shadow-xl shadow-blue-100">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-300/30 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-100 uppercase tracking-widest mb-0.5">
                  1:1 Sessions
                </p>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Available Sessions
                </h1>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-center min-w-[72px]">
                <p className="text-xl font-bold text-white">{totalAvailable}</p>
                <p className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">
                  Open
                </p>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-center min-w-[72px]">
                <p className="text-xl font-bold text-white">{totalBooked}</p>
                <p className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">
                  Booked
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Body grid */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Session Info
              </p>
              <div className="space-y-2.5">
                {[
                  {
                    icon: User,
                    label: "Teacher",
                    value: `${teacherId?.slice(0, 10)}…`,
                  },
                  { icon: Video, label: "Format", value: "Online Video Call" },
                  { icon: Clock, label: "Duration", value: "15 min / slot" },
                  { icon: MapPin, label: "Location", value: "Virtual" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Slots Panel */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <h2 className="text-sm font-bold text-gray-900">
                  Session Slots
                </h2>
                <span className="ml-auto px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold">
                  {slots.length}
                </span>
              </div>

              <div className="p-5">
                {slots.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 border border-gray-100">
                      <CalendarDays className="h-5 w-5 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      No Sessions Available
                    </h3>
                    <p className="text-xs text-gray-400 max-w-xs">
                      This teacher hasn't added any availability slots yet.
                    </p>
                  </div>
                )}

                {slots.length > 0 && sortedDates.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 border border-gray-100">
                      <CalendarDays className="h-5 w-5 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      No Slots Found
                    </h3>
                    <p className="text-xs text-gray-400 max-w-xs">
                      No slots available at the moment.
                    </p>
                  </div>
                )}

                {sortedDates.length > 0 && (
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
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.25 }}
                          className="border border-gray-100 rounded-xl overflow-hidden"
                        >
                          <button
                            onClick={() => toggleDateCollapse(dateKey)}
                            className="w-full px-5 py-3.5 bg-white flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              </div>
                              <div className="text-left">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-gray-900 text-sm">
                                    {d.full}
                                  </h3>
                                  {d.isToday && (
                                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
                                      Today
                                    </span>
                                  )}
                                  {d.isTomorrow && (
                                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full uppercase">
                                      Tomorrow
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {availSlots.length} open ·{" "}
                                  {bookedSlots.length} booked
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {availSlots.length > 0 && (
                                <span className="hidden sm:inline-flex text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full uppercase">
                                  {availSlots.length} open
                                </span>
                              )}
                              {isCollapsed ? (
                                <ChevronDown className="h-4 w-4 text-gray-300" />
                              ) : (
                                <ChevronUp className="h-4 w-4 text-gray-300" />
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
                                <div className="border-t border-gray-100 bg-gray-50/50 p-4">
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
                                            bookSlot(
                                              slot._id,
                                              slot,
                                              blockStartTime,
                                            )
                                          }
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  {dateSlots.length > 3 && (
                                    <p className="text-[10px] text-gray-300 font-semibold uppercase tracking-widest text-right mt-2 pr-1">
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
      </div>
    </div>
  );
};

export default TeacherDetail;
