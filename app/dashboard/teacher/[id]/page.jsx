"use client";

import { useStudent } from "@/app/context/StudentContext";
import api from "@/app/lib/api";
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
  AlertCircle,
  ArrowLeft,
  Video,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";
import { SlotCard } from "@/component/SlotCard";
import { motion, AnimatePresence } from "framer-motion";

// ── Helpers ──────────────────────────────────────────────────────
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

const FILTER_OPTIONS = { ALL: "all", AVAILABLE: "available", BOOKED: "booked" };

// ── Component ─────────────────────────────────────────────────────
const TeacherDetail = () => {
  const { id } = useParams();
  const { student } = useStudent();

  const [slots, setSlots] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filter, setFilter] = useState(FILTER_OPTIONS.ALL);
  const [showBooked, setShowBooked] = useState(true);
  const [collapsedDates, setCollapsedDates] = useState({});
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await api.get(`/availability/${id}`);
        setSlots(res.data || []);
      } catch {
        setError("Failed to load availability slots.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!id || !student?._id || slots.length === 0) return;
    (async () => {
      try {
        const res = await api.get(`/session/student/${student._id}`, {
          withCredentials: true,
        });
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
  }, [id, student, slots]);

  const getSessionsForSlot = (slotId) =>
    sessions.filter((s) => s.slot_id === slotId);

  const bookSlot = async (slotId, slot, blockStartTime) => {
    if (!student) {
      alert("Please login to book a slot");
      return;
    }
    try {
      const blockId = `${slotId}-${blockStartTime}`;
      setBookingId(blockId);
      const requestedTimeIso = new Date(
        `${slot.date}T${blockStartTime}`,
      ).toISOString();
      const res = await api.put(`/session/book/${slotId}`, {
        student_id: student._id,
        teacher_id: id,
        duration: 15,
        requested_time: requestedTimeIso,
      });
      const newSession = res.data?.session;
      if (newSession) setSessions((prev) => [...prev, newSession]);
      setSlots((prev) => [...prev]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to book slot.");
    } finally {
      setBookingId(null);
    }
  };

  const toggleDateCollapse = (dateKey) =>
    setCollapsedDates((prev) => ({ ...prev, [dateKey]: !prev[dateKey] }));

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400 font-medium">Loading sessions…</p>
        </div>
      </div>
    );

  // ── Error ──
  if (error)
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
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );

  // ── Main ──
  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`.scrollbar-none::-webkit-scrollbar{display:none}.scrollbar-none{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 font-semibold transition-colors group mb-6"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Page header */}
        <div className="bg-blue-600 rounded-2xl px-7 py-8 mb-6 relative overflow-hidden shadow-xl shadow-blue-100">
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
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
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
          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-4">
            {/* Session info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Session Info
              </p>
              <div className="space-y-2.5">
                {[
                  {
                    icon: User,
                    label: "Teacher ID",
                    value: `${id.slice(0, 10)}…`,
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

            {/* Filters — collapsible on mobile */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="w-full flex items-center justify-between px-5 py-4 lg:cursor-default"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Filters
                  </p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-300 lg:hidden transition-transform ${filterOpen ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`px-5 pb-5 space-y-4 lg:block ${filterOpen ? "block" : "hidden"}`}
              >
                {/* Status tabs */}
                <div className="flex bg-gray-50 rounded-xl p-1 gap-1 border border-gray-100">
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
                      className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        filter === opt.key
                          ? "bg-blue-600 text-white shadow-md shadow-blue-100 border border-blue-500"
                          : "text-gray-400 hover:text-blue-600"
                      }`}
                    >
                      {opt.label} ({opt.count})
                    </button>
                  ))}
                </div>

                {/* Toggle */}
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-sm font-semibold text-gray-700">
                    Show booked
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showBooked}
                      onChange={(e) => setShowBooked(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-9 h-5 rounded-full transition-colors ${showBooked ? "bg-blue-600" : "bg-gray-200"}`}
                    >
                      <div
                        className={`absolute w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform top-[3px] ${showBooked ? "translate-x-[18px]" : "translate-x-[3px]"}`}
                      />
                    </div>
                  </div>
                </label>

                {/* Date pills */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    By Date
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedDate(null)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                        !selectedDate
                          ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                          : "bg-gray-50 text-gray-500 border border-gray-200 hover:border-blue-200"
                      }`}
                    >
                      All
                    </button>
                    {sortedDates.map((dateKey) => {
                      const d = formatDate(dateKey);
                      const label = d.isToday
                        ? "Today"
                        : d.isTomorrow
                          ? "Tomorrow"
                          : d.short;
                      return (
                        <button
                          key={dateKey}
                          onClick={() => setSelectedDate(dateKey)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                            selectedDate === dateKey
                              ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                              : "bg-gray-50 text-gray-500 border border-gray-200 hover:border-blue-200"
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
          </aside>

          {/* ── Slots Panel ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Panel header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <h2 className="text-sm font-bold text-gray-900">
                  Session Slots
                </h2>
                <span className="ml-auto px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold">
                  {filtered.length}
                </span>
              </div>

              <div className="p-5">
                {/* Empty — no slots */}
                {slots.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 border border-gray-100">
                      <CalendarDays className="h-5 w-5 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      No Sessions Available
                    </h3>
                    <p className="text-xs text-gray-400 max-w-xs">
                      Check back later for new availability.
                    </p>
                  </div>
                )}

                {/* Empty — filters */}
                {slots.length > 0 && sortedDates.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 border border-gray-100">
                      <Filter className="h-5 w-5 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      No Slots Match
                    </h3>
                    <p className="text-xs text-gray-400 max-w-xs mb-5">
                      Try adjusting your filters.
                    </p>
                    <button
                      onClick={() => {
                        setFilter(FILTER_OPTIONS.ALL);
                        setSelectedDate(null);
                        setShowBooked(true);
                      }}
                      className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}

                {/* Date groups */}
                {sortedDates.length > 0 && (
                  <div className="space-y-3">
                    {sortedDates.map((dateKey, idx) => {
                      if (selectedDate && selectedDate !== dateKey) return null;
                      const dateSlots = grouped[dateKey];
                      const d = formatDate(dateKey);
                      const availSlots = dateSlots.filter((s) => !s.is_booked);
                      const bookedSlots = dateSlots.filter((s) => s.is_booked);
                      const isCollapsed = collapsedDates[dateKey];
                      if (!showBooked && availSlots.length === 0) return null;
                      const visible = showBooked
                        ? dateSlots
                        : dateSlots.filter((s) => !s.is_booked);

                      return (
                        <motion.div
                          key={dateKey}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.25 }}
                          className="border border-gray-100 rounded-xl overflow-hidden"
                        >
                          {/* Date row */}
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

                          {/* Slot cards */}
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
                                  {/* Horizontal scrollable row */}
                                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                                    {visible.map((slot) => (
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
                                  {/* Scroll hint — only shows when more than 3 cards */}
                                  {visible.length > 3 && (
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
