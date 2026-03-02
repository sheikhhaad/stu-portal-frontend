"use client";

import { useStudent } from "@/app/context/StudentContext";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  GraduationCap,
  CheckCircle2,
  CalendarDays,
  Lock,
  User,
  MapPin,
  Filter,
  Info,
  AlertCircle,
  ArrowLeft,
  Video,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SlotCard } from "@/component/SlotCard";

// ── Helpers ─────────────────────────────────────────────────────
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

const FILTER_OPTIONS = { ALL: "all", AVAILABLE: "available", BOOKED: "booked" };

// ── Component ────────────────────────────────────────────────────
const TeacherDetail = () => {
  const { id } = useParams(); // teacher _id
  const { student } = useStudent();

  const [slots, setSlots] = useState([]);
  const [sessions, setSessions] = useState([]); // ✅ always array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filter, setFilter] = useState(FILTER_OPTIONS.ALL);
  const [showBooked, setShowBooked] = useState(true);
  const [collapsedDates, setCollapsedDates] = useState({});

  // ── 1. Fetch slots ──
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await axios.get(
          `https://stu-portal-backend.vercel.app/api/availability/${id}`,
        );
        setSlots(res.data || []);
      } catch {
        setError("Failed to load availability slots.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ── 2. Fetch sessions — runs after slots are loaded ──
  // Your API: GET /api/availability/student/:studentId/slot/:slotId
  // Returns array of sessions for this student. We store all of them.
  useEffect(() => {
    if (!id || !student?._id || slots.length === 0) return;
    (async () => {
      try {
        // Fetch once using first slot — backend returns ALL sessions for this student+teacher
        const res = await axios.get(
          `https://stu-portal-backend.vercel.app/api/availability/student/${student._id}`,
          { withCredentials: true },
        );
        console.log(res.data);

        // ✅ Normalise — your API returns [{...}] plain array
        const raw = res.data;
        const normalised = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.sessions)
            ? raw.sessions
            : raw?._id
              ? [raw]
              : [];
        setSessions(normalised);
      } catch {
        setSessions([]);
      }
    })();
  }, [id, student, slots]); // ← depends on slots so it fires after slots load

  // ── Find session for a given slot._id ──
  // session.slot_id === slot._id
  const getSessionForSlot = (slotId) =>
    sessions.find((s) => s.slot_id === slotId) ?? null;

  // ── Book slot ──
  const bookSlot = async (slotId, slot) => {
    if (!student) {
      alert("Please login to book a slot");
      return;
    }
    let duration = prompt("Enter duration in minutes");
    if (!duration) {
      alert("Please enter duration");
      return;
    }

    try {
      setBookingId(slotId);
      const res = await axios.put(
        `https://stu-portal-backend.vercel.app/api/availability/book/${slotId}`,
        {
          student_id: student._id,
          teacher_id: id,
          duration,
          requested_time: new Date(
            `${slot.date}T${slot.start_time}`,
          ).toISOString(),
        },
      );
      const newSession = res.data?.session;
      if (newSession) setSessions((prev) => [...prev, newSession]);
      setSlots((prev) =>
        prev.map((s) => (s._id === slotId ? { ...s, is_booked: true } : s)),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to book slot.");
    } finally {
      setBookingId(null);
    }
  };

  const toggleDateCollapse = (dateKey) =>
    setCollapsedDates((prev) => ({ ...prev, [dateKey]: !prev[dateKey] }));

  // ── Derived ──
  const filtered =
    filter === "available"
      ? slots.filter((s) => !s.is_booked)
      : filter === "booked"
        ? slots.filter((s) => s.is_booked)
        : slots;

  const grouped = groupSlotsByDate(filtered);
  const totalAvailable = slots.filter((s) => !s.is_booked).length;
  const totalBooked = slots.filter((s) => s.is_booked).length;
  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(a) - new Date(b),
  );

  // ── Loading ──
  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-slate-200 border-t-indigo-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-medium">
            Loading sessions...
          </p>
        </div>
      </div>
    );

  // ── Error ──
  if (error)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-red-100 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Something went wrong
          </h3>
          <p className="text-slate-500 text-sm mb-5">{error}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );

  // ── Main Render ──
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="py-5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 font-semibold transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 px-8 py-10 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex items-center gap-5">
              <div className="flex-shrink-0 bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/25 shadow-inner">
                <GraduationCap className="h-9 w-9 text-white" />
              </div>
              <div>
                <span className="inline-block px-3 py-1 bg-white/15 border border-white/25 rounded-full text-[10px] font-bold text-white/90 uppercase tracking-widest mb-3">
                  1:1 Sessions
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none mb-2">
                  Available Sessions
                </h1>
                <p className="text-indigo-100 text-sm font-medium">
                  Book a personal session with your instructor
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-5">
                {/* Session Info */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-indigo-100 transition-all">
                  <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <Info className="h-4 w-4 text-indigo-600" />
                    </div>
                    Session Details
                  </h2>
                  <div className="space-y-3">
                    {[
                      {
                        icon: User,
                        label: "Teacher ID",
                        value: `${id.slice(0, 12)}...`,
                      },
                      {
                        icon: Video,
                        label: "Meeting Type",
                        value: "Online Video Call",
                      },
                      {
                        icon: Clock,
                        label: "Duration",
                        value: "15 minutes per session",
                      },
                      {
                        icon: MapPin,
                        label: "Location",
                        value: "Virtual / Online",
                      },
                    ].map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-xl hover:bg-indigo-50/50 transition-colors"
                      >
                        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 flex-shrink-0">
                          <Icon className="h-4 w-4 text-indigo-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                            {label}
                          </p>
                          <p className="text-slate-800 font-semibold text-sm">
                            {value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-3 right-3 opacity-[0.07]">
                    <Users className="w-20 h-20" />
                  </div>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <CalendarDays className="h-3.5 w-3.5 text-indigo-400" />
                    </div>
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                      Slot Summary
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      {
                        icon: CheckCircle2,
                        color: "text-emerald-400",
                        label: "Available",
                        value: totalAvailable,
                        valueColor: "text-emerald-400",
                      },
                      {
                        icon: Lock,
                        color: "text-red-400",
                        label: "Booked",
                        value: totalBooked,
                        valueColor: "text-red-400",
                      },
                      {
                        icon: CalendarDays,
                        color: "text-indigo-400",
                        label: "Total Slots",
                        value: slots.length,
                        valueColor: "text-white",
                      },
                      {
                        icon: Calendar,
                        color: "text-indigo-400",
                        label: "Days Available",
                        value: sortedDates.length,
                        valueColor: "text-white",
                      },
                    ].map(({ icon: Icon, color, label, value, valueColor }) => (
                      <div
                        key={label}
                        className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                      >
                        <span className="text-slate-400 text-sm flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${color}`} />
                          {label}
                        </span>
                        <span className={`font-bold text-sm ${valueColor}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <Filter className="h-4 w-4 text-indigo-600" />
                    </div>
                    Filters
                  </h2>
                  <div className="space-y-4">
                    <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                      {[
                        {
                          key: FILTER_OPTIONS.ALL,
                          label: "All",
                          count: slots.length,
                        },
                        {
                          key: FILTER_OPTIONS.AVAILABLE,
                          label: "Open",
                          count: totalAvailable,
                        },
                        {
                          key: FILTER_OPTIONS.BOOKED,
                          label: "Booked",
                          count: totalBooked,
                        },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setFilter(opt.key)}
                          className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                            filter === opt.key
                              ? "bg-white text-indigo-600 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          {opt.label} ({opt.count})
                        </button>
                      ))}
                    </div>

                    <label className="flex items-center justify-between cursor-pointer p-3.5 bg-slate-50 rounded-xl hover:bg-indigo-50/50 transition-colors">
                      <span className="text-sm font-semibold text-slate-700">
                        Show booked slots
                      </span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={showBooked}
                          onChange={(e) => setShowBooked(e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          className={`w-10 h-6 rounded-full transition-colors duration-200 ${showBooked ? "bg-indigo-600" : "bg-slate-300"}`}
                        >
                          <div
                            className={`absolute w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 top-1 ${showBooked ? "translate-x-5" : "translate-x-1"}`}
                          />
                        </div>
                      </div>
                    </label>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                        Filter by Date
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedDate(null)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            !selectedDate
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-indigo-200"
                          }`}
                        >
                          All Dates
                        </button>
                        {sortedDates.map((dateKey) => {
                          const d = formatDate(dateKey);
                          let label = d.short;
                          if (d.isToday) label = "Today";
                          else if (d.isTomorrow) label = "Tomorrow";
                          return (
                            <button
                              key={dateKey}
                              onClick={() => setSelectedDate(dateKey)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                selectedDate === dateKey
                                  ? "bg-indigo-600 text-white shadow-sm"
                                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-indigo-200"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slots Panel */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center px-6 py-5 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                      <CalendarDays className="h-5 w-5 text-indigo-600" />
                      Session Slots
                      <span className="ml-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                        {filtered.length}
                      </span>
                    </h2>
                  </div>

                  <div className="p-5">
                    {slots.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 border border-slate-100">
                          <CalendarDays className="h-7 w-7 text-slate-300" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1.5">
                          No Sessions Available
                        </h3>
                        <p className="text-slate-400 text-sm text-center max-w-xs">
                          Check back later for new availability.
                        </p>
                      </div>
                    ) : sortedDates.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 border border-slate-100">
                          <Clock className="h-7 w-7 text-slate-300" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1.5">
                          No Slots Match
                        </h3>
                        <p className="text-slate-400 text-sm text-center max-w-xs mb-5">
                          Try adjusting your filters.
                        </p>
                        <button
                          onClick={() => {
                            setFilter(FILTER_OPTIONS.ALL);
                            setSelectedDate(null);
                            setShowBooked(true);
                          }}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all"
                        >
                          Clear Filters
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sortedDates.map((dateKey) => {
                          if (selectedDate && selectedDate !== dateKey)
                            return null;
                          const dateSlots = grouped[dateKey];
                          const d = formatDate(dateKey);
                          const availSlots = dateSlots.filter(
                            (s) => !s.is_booked,
                          );
                          const bookedSlots = dateSlots.filter(
                            (s) => s.is_booked,
                          );
                          const isCollapsed = collapsedDates[dateKey];
                          if (!showBooked && availSlots.length === 0)
                            return null;
                          const visible = showBooked
                            ? dateSlots
                            : dateSlots.filter((s) => !s.is_booked);

                          return (
                            <div
                              key={dateKey}
                              className="border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-100 transition-colors"
                            >
                              <button
                                onClick={() => toggleDateCollapse(dateKey)}
                                className="w-full px-5 py-4 bg-white flex items-center justify-between hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-center gap-3.5">
                                  <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Calendar className="h-4 w-4 text-indigo-600" />
                                  </div>
                                  <div className="text-left">
                                    <h3 className="font-bold text-slate-900 text-sm">
                                      {d.full}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
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
                                      <span className="text-xs text-slate-400">
                                        {availSlots.length} available ·{" "}
                                        {bookedSlots.length} booked
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                  {availSlots.length > 0 && (
                                    <span className="hidden sm:inline-flex text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full uppercase">
                                      {availSlots.length} open
                                    </span>
                                  )}
                                  {isCollapsed ? (
                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                  ) : (
                                    <ChevronUp className="h-4 w-4 text-slate-400" />
                                  )}
                                </div>
                              </button>

                              {!isCollapsed && (
                                <div className="border-t border-slate-100 bg-slate-50/50 p-5">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {visible.map((slot) => (
                                      <SlotCard
                                        key={slot._id}
                                        slot={slot}
                                        isBooked={slot.is_booked}
                                        duration={getDuration(
                                          slot.start_time,
                                          slot.end_time,
                                        )}
                                        isBooking={bookingId === slot._id}
                                        onBook={bookSlot}
                                        session={getSessionForSlot(slot._id)} // ✅ slot._id === session.slot_id
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
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
      </div>
    </div>
  );
};

export default TeacherDetail;
