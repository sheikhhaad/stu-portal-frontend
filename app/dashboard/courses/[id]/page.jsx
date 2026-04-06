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
  HelpCircle,
  FileText,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import api from "@/app/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const getStatusInfo = (status) => {
  switch (status?.toLowerCase()) {
    case "resolved":
      return {
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        label: "Resolved",
        icon: CheckCircle,
      };
    case "rejected":
      return {
        color: "text-rose-700",
        bg: "bg-rose-50",
        label: "Rejected",
        icon: XCircle,
      };
    default:
      return {
        color: "text-amber-700",
        bg: "bg-amber-50",
        label: "Pending",
        icon: HelpCircle,
      };
  }
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { student } = useStudent();
  const { queries, fetchCourseQueries, addQuery } = useQueries();

  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null);
  const [teacherId, setTeacherId] = useState(null);
  const [expandedQueries, setExpandedQueries] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Derived queries for this course
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
    const fetchCourse = async () => {
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
    };
    fetchCourse();
  }, [student, id]);

  // Fetch teacher info
  useEffect(() => {
    if (!student || !id) return;
    const fetchTeacher = async () => {
      try {
        const enrollmentRes = await api.get(`/enrollments/teacher/${id}`);
        const enrollment = enrollmentRes.data;
        const teacherEnrollment = enrollment?.teacherEnrollments?.find(
          (enroll) => enroll.course_id === id,
        );
        if (teacherEnrollment?.teacher_id) {
          const tid = teacherEnrollment.teacher_id;
          setTeacherId(tid);
          const teacherRes = await api.get(`/enrollments/teacher/info/${tid}`, {
            withCredentials: true,
          });
          setTeacher(teacherRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch teacher info:", err);
      }
    };
    fetchTeacher();
  }, [student, id]);

  // Fetch queries for this course
  useEffect(() => {
    if (!student || !id || !course) return;
    fetchCourseQueries(id);
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
      addQuery(res.data.query || res.data);
      setIsModalOpen(false);
      setQueryText("");
    } catch (err) {
      setSubmitError(err.response?.data?.msg || "Failed to submit query.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAnswer = (queryId) => {
    setExpandedQueries((prev) => ({ ...prev, [queryId]: !prev[queryId] }));
  };

  const getTeacherName = () =>
    teacher?.teacher?.name || teacher?.name || "Faculty Member";
  const getTeacherInitial = () => getTeacherName().charAt(0).toUpperCase();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-medium">
            Loading course...
          </p>
        </div>
      </div>
    );
  }

  // Error or no student
  if (!student)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm shadow-sm">
          <GraduationCap className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">
            Please log in to view this page.
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm shadow-sm">
          <XCircle className="h-10 w-10 text-rose-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Access Denied
          </h3>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );

  if (!course) return null;

  const resolvedCount = courseQueries.filter(
    (q) => q.status === "resolved",
  ).length;
  const pendingCount = courseQueries.filter(
    (q) => q.status !== "resolved",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Header with back button and teacher action */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 font-medium transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </Link>
          {teacher && teacherId && (
            <button
              onClick={() => router.push(`/dashboard/teacher/${teacherId}`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow"
            >
              <CalendarDays className="h-4 w-4" />
              Book a session with {getTeacherName()}
            </button>
          )}
        </div>

        {/* Course Hero Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium mb-4">
                  <BookOpen className="h-3 w-3" />
                  Active Course
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  {course.title || course.name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {getTeacherName()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5" />
                    {course.code || "N/A"}
                  </span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex gap-3">
                <div className="bg-slate-50 rounded-xl px-4 py-2 text-center min-w-[70px]">
                  <p className="text-xl font-bold text-slate-800">
                    {courseQueries.length}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                    Queries
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl px-4 py-2 text-center min-w-[70px]">
                  <p className="text-xl font-bold text-emerald-600">
                    {resolvedCount}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                    Resolved
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl px-4 py-2 text-center min-w-[70px]">
                  <p className="text-xl font-bold text-amber-600">
                    {pendingCount}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                    Pending
                  </p>
                </div>
              </div>
            </div>

            {/* Course schedule row */}
            <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    Schedule
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    {course.days || "Mon, Wed, Fri"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    Time
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    {course.time || "10:00 – 11:30 AM"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Queries Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-800">
                Questions & Discussions
              </h2>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">
                {courseQueries.length}
              </span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-all shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Ask a question
            </button>
          </div>

          <div className="p-5">
            {courseQueries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-slate-300" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  No questions yet
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mb-5">
                  Have a doubt? Ask your instructor directly.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ask your first question
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {courseQueries.map((query, idx) => {
                  const status = getStatusInfo(query.status);
                  const StatusIcon = status.icon;
                  const isExpanded = expandedQueries[query._id];

                  return (
                    <motion.div
                      key={query._id || idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`border rounded-xl transition-all ${isExpanded ? "border-slate-200 shadow-sm" : "border-slate-100"}`}
                    >
                      <div
                        className="px-5 py-4 bg-white cursor-pointer"
                        onClick={() => toggleAnswer(query._id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${status.bg} ${status.color}`}
                              >
                                <StatusIcon className="h-2.5 w-2.5" />
                                {status.label}
                              </span>
                              <span className="text-[10px] text-slate-400">
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
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {query.query}
                            </p>
                          </div>
                          <button className="shrink-0 p-1 text-slate-400 hover:text-slate-600">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 pt-0 border-t border-slate-100 bg-slate-50/50">
                              {query.answer ? (
                                <div className="mt-4 bg-white rounded-xl p-4 border border-slate-100">
                                  <div className="flex items-center gap-2.5 mb-3">
                                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold uppercase">
                                      {getTeacherInitial()}
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-slate-800">
                                        {getTeacherName()}
                                      </p>
                                      <p className="text-[10px] text-slate-400">
                                        Response
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-sm text-slate-600 leading-relaxed pl-3 border-l-2 border-slate-200">
                                    {query.answer}
                                  </p>
                                </div>
                              ) : (
                                <div className="mt-4 flex items-center gap-2 py-2">
                                  <div className="flex gap-1">
                                    <div
                                      className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"
                                      style={{ animationDelay: "0ms" }}
                                    />
                                    <div
                                      className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"
                                      style={{ animationDelay: "150ms" }}
                                    />
                                    <div
                                      className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"
                                      style={{ animationDelay: "300ms" }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
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
            )}
          </div>
        </div>
      </div>

      {/* Modal for new query */}
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
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md pointer-events-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Ask a question
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {course.title || course.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <form onSubmit={handleSubmitQuery} className="p-6">
                  <div className="mb-5">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Your question
                    </label>
                    <textarea
                      value={queryText}
                      onChange={(e) => setQueryText(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 transition-all resize-none"
                      placeholder="Describe your doubt clearly..."
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      {queryText.length > 0
                        ? `${queryText.length} characters`
                        : "Be specific for a faster response"}
                    </p>
                  </div>
                  {submitError && (
                    <div className="mb-4 px-4 py-2 bg-rose-50 text-rose-600 text-xs font-medium rounded-lg">
                      {submitError}
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !queryText.trim()}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-xs font-medium transition-all"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {isSubmitting ? "Sending..." : "Post question"}
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
