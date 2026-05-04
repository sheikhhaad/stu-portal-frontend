// app/dashboard/courses/[id]/page.jsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useStudent } from "@/app/context/StudentContext";
import { useQueries } from "@/app/context/QueryContext";
import { useEnrollMent } from "@/app/context/TeacherEnroll";
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
  ShieldCheck,
  RefreshCw,
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
  const { course: enrolledCourses, loading: enrollLoading } = useEnrollMent();

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

  // Fetch course enrollment from global context
  useEffect(() => {
    if (!enrolledCourses || !id) return;
    
    const found = enrolledCourses.find(
      (c) => c._id === id || c.id === id,
    );
    
    if (found) {
      setCourse(found);
      setError("");
      setLoading(false);
    } else if (!enrollLoading) {
      setError("You are not enrolled in this course.");
      setLoading(false);
    }
  }, [enrolledCourses, id, enrollLoading]);

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
  if (loading || enrollLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl h-40 animate-pulse border border-slate-100" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-100 rounded-xl h-24 animate-pulse" />
          ))}
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
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm shadow-sm border border-rose-100">
          <XCircle className="h-10 w-10 text-rose-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Access Denied
          </h3>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button onClick={() => router.push("/dashboard")} className="text-xs font-bold text-blue-600 hover:underline">Return to Dashboard</button>
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

  const stats = [
    {
      label: "Total Queries",
      value: courseQueries.length,
      icon: MessageSquare,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Resolved",
      value: resolvedCount,
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Pending",
      value: pendingCount,
      icon: HelpCircle,
      color: "text-amber-600 bg-amber-50",
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
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl font-bold text-slate-800">
              {course.title || course.name}
            </h1>
          </div>
          <p className="text-slate-500 text-sm ml-7">
            {course.code || "Course Details"} • {getTeacherName()}
          </p>
        </div>
        {teacher && teacherId && (
          <button
            onClick={() => router.push(`/dashboard/teacher/${teacherId}`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-100 text-sm font-bold"
          >
            <CalendarDays className="h-4 w-4" />
            Book Session
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 border border-slate-100 flex justify-between"
          >
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-2xl font-bold mt-1">
                {stat.value}
              </p>
            </div>
            <div className={`${stat.color} p-2 rounded-lg h-fit`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Info and Queries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Left: Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Course Info</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Schedule</p>
                  <p className="text-sm font-semibold text-slate-700">{course.days || "Mon, Wed, Fri"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Time</p>
                  <p className="text-sm font-semibold text-slate-700">{course.time || "10:00 – 11:30 AM"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Queries */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Discussion Forum</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Ask Question
            </button>
          </div>

          {courseQueries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-slate-300" />
              </div>
              <h3 className="text-slate-800 font-bold mb-1">No questions yet</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">Be the first to start a discussion about this course.</p>
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
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-blue-100 transition-colors shadow-sm"
                  >
                    <div
                      className="px-5 py-4 cursor-pointer"
                      onClick={() => toggleAnswer(query._id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${status.bg} ${status.color}`}>
                              <StatusIcon className="h-2.5 w-2.5" />
                              {status.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(query.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed">
                            {query.query}
                          </p>
                        </div>
                        <div className="p-1 text-slate-300">
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-slate-50/50 border-t border-slate-50 p-5"
                        >
                          {query.answer ? (
                            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-white text-[10px] font-bold uppercase">
                                  {getTeacherInitial()}
                                </div>
                                <span className="text-xs font-bold text-slate-800">{getTeacherName()}</span>
                                <span className="text-[10px] text-slate-400 ml-auto">Instructor Response</span>
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed pl-3 border-l-2 border-blue-100">
                                {query.answer}
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 py-2">
                              <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Awaiting Response</span>
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

      {/* Modal for new query */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Ask a Question</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleSubmitQuery} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Your Question</label>
                    <textarea
                      value={queryText}
                      onChange={(e) => setQueryText(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none resize-none"
                      placeholder="Type your question here..."
                      required
                    />
                  </div>
                  {submitError && (
                    <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg border border-rose-100">
                      {submitError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting || !queryText.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-100"
                  >
                    {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {isSubmitting ? "Posting..." : "Post Question"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
