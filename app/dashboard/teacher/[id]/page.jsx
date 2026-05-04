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
  Clock3,
  CalendarCheck,
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

  const [teacher, setTeacher] = useState(null);
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

  const fetchTeacherInfo = useCallback(async () => {
    if (!teacherId) return;
    try {
      const res = await api.get(`/enrollments/teacher/info/${teacherId}`);
      if (isMounted.current) setTeacher(res.data?.teacher || res.data);
    } catch (err) {
      console.error("Failed to fetch teacher info:", err);
    }
  }, [teacherId]);

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
    await Promise.all([fetchTeacherInfo(), fetchSlots(), fetchSessions()]);
    setRefreshing(false);
  }, [fetchTeacherInfo, fetchSlots, fetchSessions]);

  useEffect(() => {
    if (teacherId) {
      fetchTeacherInfo();
      fetchSlots();
      if (student?._id) fetchSessions();
    }
  }, [teacherId, student?._id, fetchTeacherInfo, fetchSlots, fetchSessions]);

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
      <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl h-40 animate-pulse border border-slate-100" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-slate-100 rounded-xl h-24 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const teacherName = teacher?.name || "Teacher";
  const teacherInitial = teacherName.charAt(0).toUpperCase();

  const stats = [
    {
      label: "Available Slots",
      value: totalAvailable,
      icon: Clock3,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Your Bookings",
      value: sessions.length,
      icon: CalendarCheck,
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto space-y-7 px-4 sm:px-6 py-6 md:py-8"
    >
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-xl font-bold">
            {teacherInitial}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{teacherName}</h1>
            <p className="text-slate-500 text-sm">
              Book a 1:1 Session • Virtual Call
            </p>
          </div>
        </div>
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition disabled:opacity-50"
        >
          <RefreshCw
            className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 border border-slate-100 flex justify-between"
          >
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className={`${stat.color} p-2 rounded-lg h-fit`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Slots Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Available Time Slots
            </h2>
          </div>
          <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold">
            {slots.length} TOTAL SLOTS
          </span>
        </div>

        <div className="p-5">
          {slots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-50 rounded-2xl">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <CalendarDays className="h-8 w-8 text-slate-200" />
              </div>
              <h3 className="text-slate-800 font-bold mb-1">
                No sessions available
              </h3>
              <p className="text-xs text-slate-400 max-w-xs">
                This teacher hasn't added any availability yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
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
                    className="border border-slate-50 rounded-2xl overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => toggleDateCollapse(dateKey)}
                      className="w-full px-6 py-4 bg-white flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-800">
                              {d.full}
                            </span>
                            {d.isToday && (
                              <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md tracking-wider">
                                Today
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {availSlots.length} open · {bookedSlots.length}{" "}
                            booked
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {availSlots.length > 0 && (
                          <span className="hidden sm:inline-block text-[10px] font-bold bg-blue-600 text-white px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            {availSlots.length} Free
                          </span>
                        )}
                        <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                          {isCollapsed ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronUp className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-slate-50/30 border-t border-slate-50"
                        >
                          <div className="p-6 overflow-x-auto scrollbar-none flex gap-4 snap-x snap-mandatory">
                            {dateSlots.map((slot) => (
                              <div
                                key={slot._id}
                                className="flex-shrink-0 w-72 snap-start"
                              >
                                <SlotCard
                                  slot={slot}
                                  timeBlocks={generateTimeBlocks(slot)}
                                  slotSessions={getSessionsForSlot(slot._id)}
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
                          {dateSlots.length > 2 && (
                            <div className="px-6 pb-3 flex justify-end">
                              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                                Scroll for more{" "}
                                <ChevronRight className="h-3 w-3" />
                              </p>
                            </div>
                          )}
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
    </motion.div>
  );
}
