// app/dashboard/courses/[id]/page.jsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useStudent } from "@/app/context/StudentContext";
import { useQueries } from "@/app/context/QueryContext";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  User,
  Hash,
  MessageSquare,
  X,
  Send,
  GraduationCap,
  CheckCircle,
  XCircle,
  ChevronRight,
  Plus,
  ChevronDown,
  ChevronUp,
  CalendarDays,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import api from "@/app/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const getStatusInfo = (status) => {
  switch (status?.toLowerCase()) {
    case "resolved":
      return {
        color: "text-blue-700",
        bg: "bg-blue-50 border-blue-200",
        dot: "bg-blue-500",
        label: "Resolved",
        icon: CheckCircle,
      };
    case "rejected":
      return {
        color: "text-red-700",
        bg: "bg-red-50 border-red-200",
        dot: "bg-red-500",
        label: "Rejected",
        icon: XCircle,
      };
    default:
      return {
        color: "text-sky-700",
        bg: "bg-sky-50 border-sky-200",
        dot: "bg-sky-400",
        label: "Pending",
        icon: Clock,
      };
  }
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { student } = useStudent();
  const { queries, fetchCourseQueries, addQuery, refreshQueries } =
    useQueries();

  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [expandedQueries, setExpandedQueries] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [teacher, setTeacher] = useState(null);
  const [teacherId, setTeacherId] = useState(null);

  // ✅ Derive course queries from context — auto-updates on socket events
  // Consistent check using only student_id field
  const courseQueries = useMemo(
    () =>
      queries.filter(
        (q) => q.course_id === id && q.student_id === student?._id,
      ),
    [queries, id, student?._id],
  );

  // Fetch course enrollment
  useEffect(() => {
    if (!student || !id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/enrollments/student/${student._id}`);
        const found = (res.data.courses || []).find(
          (c) => c._id === id || c.id === id,
        );
        if (found) {
          setCourse(found);
          setError("");
        } else {
          setError("You are not enrolled in this course.");
        }
      } catch {
        setError("Failed to load course information.");
      } finally {
        setLoading(false);
      }
    })();
  }, [student, id]);

  // Fetch teacher info
  useEffect(() => {
    if (!student || !id) return;
    (async () => {
      try {
        const enrollmentRes = await api.get(`/enrollments/teacher/${id}`);
        const enrollment = enrollmentRes.data;
        if (enrollment?.teacherEnrollments?.length > 0) {
          const teacherEnrollment = enrollment.teacherEnrollments.find(
            (enroll) => enroll.course_id === id,
          );
          if (teacherEnrollment?.teacher_id) {
            const extractedTeacherId = teacherEnrollment.teacher_id;
            setTeacherId(extractedTeacherId);
            const teacherRes = await api.get(
              `/enrollments/teacher/info/${extractedTeacherId}`,
              { withCredentials: true },
            );
            setTeacher(teacherRes.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch teacher info:", err);
      }
    })();
  }, [student, id]);

  // ✅ Initial fetch to populate context — no local state needed after this
  useEffect(() => {
    if (!student || !id || !course) return;
    (async () => {
      setIsInitializing(true);
      await fetchCourseQueries(id);
      setIsInitializing(false);
    })();
  }, [student, id, course]);

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    if (!queryText.trim() || !student || !course || !teacherId) {
      setSubmitError("Missing required information. Please try again.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await api.post(
        `/queries/create`,
        {
          student_id: student._id,
          course_id: course._id,
          query: queryText.trim(),
          teacher_id: teacherId,
        },
        { withCredentials: true },
      );
      const newQuery = res.data.query || res.data;
      addQuery(newQuery); // ✅ adds to context, courseQueries recomputes via useMemo
      setIsModalOpen(false);
      setQueryText("");
      // ✅ no need for refreshQueries here — addQuery already updated context
    } catch (err) {
      setSubmitError(err.response?.data?.msg || "Failed to submit query.");
    } finally {
      setIsSubmitting(false);
    }
    fetchCourseQueries(id);
  };

  const toggleAnswer = (queryId, e) => {
    e?.stopPropagation();
    setExpandedQueries((prev) => ({ ...prev, [queryId]: !prev[queryId] }));
  };

  // ✅ Safe teacher name helper — handles both response shapes
  const getTeacherName = () =>
    teacher?.teacher?.name || teacher?.name || "Faculty Member";
  const getTeacherInitial = () => getTeacherName()[0]?.toUpperCase() || "F";

  if (!student)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-600 font-semibold text-sm">
            Please log in to view this page.
          </p>
        </div>
      </div>
    );

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-9 h-9 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm font-medium">Loading course…</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            Access Denied
          </h3>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );

  if (!course) return null;

  const resolved = courseQueries.filter((q) => q.status === "resolved").length;
  const pending = courseQueries.filter(
    (q) => q.status === "pending" || !q.status,
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto">
        {/* Nav row */}
        <div className="flex items-center flex-wrap gap-2 justify-between mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 font-semibold transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Dashboard
          </Link>
          {teacher && teacherId && (
            <button
              onClick={() => router.push(`/dashboard/teacher/${teacherId}`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 text-sm font-semibold rounded-xl transition-all"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              {/* ✅ consistent teacher name via helper */}
              Book session with {getTeacherName()}
            </button>
          )}
        </div>

        {/* Page banner */}
        <div className="bg-blue-600 rounded-2xl px-6 py-6 mb-6 relative overflow-hidden shadow-md shadow-blue-100">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-300/30 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-0.5">
                  Active Course
                </p>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {course.title || course.name}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1.5 text-xs text-blue-100 font-medium">
                    <User className="h-3 w-3" />
                    {/* ✅ consistent name helper */}
                    {getTeacherName()}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-blue-100 font-medium">
                    <Hash className="h-3 w-3" />
                    {course.code}
                  </span>
                </div>
              </div>
            </div>

            {/* Mini stats */}
            <div className="flex gap-3 shrink-0">
              <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-center min-w-[64px]">
                <p className="text-xl font-bold text-white">
                  {courseQueries.length}
                </p>
                <p className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">
                  Queries
                </p>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-center min-w-[64px]">
                <p className="text-xl font-bold text-white">{resolved}</p>
                <p className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">
                  Resolved
                </p>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-center min-w-[64px]">
                <p className="text-xl font-bold text-sky-200">{pending}</p>
                <p className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">
                  Pending
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                Schedule
              </p>
              <div className="space-y-2.5">
                {[
                  {
                    icon: Calendar,
                    label: "Days",
                    value: course.days || "Mon, Wed, Fri",
                  },
                  {
                    icon: Clock,
                    label: "Time",
                    value: course.time || "10:00 – 11:30 AM",
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Queries Panel */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <h2 className="text-sm font-bold text-gray-900">
                    My Queries
                  </h2>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold">
                    {courseQueries.length}
                  </span>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all active:scale-[0.99] shadow-sm uppercase tracking-wider"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Query
                </button>
              </div>

              <div className="p-5 min-h-[360px]">
                {isInitializing ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                    <p className="text-xs text-gray-400 font-medium">
                      Loading queries…
                    </p>
                  </div>
                ) : courseQueries.length > 0 ? (
                  <div className="space-y-2.5">
                    {courseQueries.map((query, idx) => {
                      const s = getStatusInfo(query.status);
                      const StatusIcon = s.icon;
                      const isExpanded = expandedQueries[query._id];

                      return (
                        <motion.div
                          key={query._id || idx}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04, duration: 0.2 }}
                          className={`border rounded-xl overflow-hidden transition-all ${
                            isExpanded
                              ? "border-gray-300"
                              : "border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          <div
                            className="px-5 py-4 bg-white cursor-pointer flex items-start justify-between gap-4 group"
                            onClick={(e) => toggleAnswer(query._id, e)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${s.bg} ${s.color}`}
                                >
                                  <StatusIcon className="h-2.5 w-2.5" />
                                  {s.label}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">
                                  {new Date(query.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors line-clamp-2 leading-snug">
                                {query.query}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 mt-0.5">
                              <button
                                onClick={(e) => toggleAnswer(query._id, e)}
                                className="p-1.5 text-gray-800 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5" />
                                ) : (
                                  <ChevronDown className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Expanded answer — updates live via socket */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-5 pb-4 pt-0 border-t border-gray-100 bg-gray-50/50">
                                  {query.answer ? (
                                    <div className="mt-4 bg-white rounded-xl p-4 border border-gray-100">
                                      <div className="flex items-center gap-2.5 mb-3">
                                        <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0">
                                          {/* ✅ consistent initial helper */}
                                          {getTeacherInitial()}
                                        </div>
                                        <div>
                                          <p className="text-xs font-bold text-gray-900">
                                            {/* ✅ consistent name helper */}
                                            {getTeacherName()}
                                          </p>
                                          <p className="text-[10px] text-gray-400">
                                            Faculty Response
                                          </p>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-600 leading-relaxed border-l-2 border-gray-200 pl-3 italic">
                                        {query.answer}
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="mt-4 flex items-center gap-2.5 py-3">
                                      <div className="flex gap-1">
                                        {[0, 150, 300].map((d) => (
                                          <div
                                            key={d}
                                            className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                                            style={{
                                              animationDelay: `${d}ms`,
                                            }}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                                        Awaiting response
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 border border-gray-100">
                      <MessageSquare className="h-5 w-5 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      No queries yet
                    </h3>
                    <p className="text-xs text-gray-400 max-w-xs mb-5">
                      Have a doubt? Ask your faculty member directly.
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Ask First Query
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Query Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md pointer-events-auto border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      New Query
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {course.title || course.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmitQuery} className="p-6">
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Your Question
                    </label>
                    <textarea
                      value={queryText}
                      onChange={(e) => setQueryText(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 outline-none focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-900/5 transition-all resize-none leading-relaxed"
                      rows="4"
                      placeholder="Describe your doubt clearly…"
                      required
                    />
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      {queryText.length > 0
                        ? `${queryText.length} characters`
                        : "Be specific for a faster response."}
                    </p>
                  </div>

                  {submitError && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-xl">
                      {submitError}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !queryText.trim()}
                      className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.99]"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {isSubmitting ? "Sending…" : "Post Query"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
