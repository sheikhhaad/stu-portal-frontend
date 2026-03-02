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
  FileText,
  MessageSquare,
  X,
  Send,
  GraduationCap,
  Users,
  BookMarked,
  CheckCircle,
  Clock as ClockIcon,
  XCircle,
  ChevronRight,
  Plus,
  ChevronDown,
  ChevronUp,
  Calendar1,
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import StatsCard from "@/component/StatsCard";

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { student } = useStudent();
  const {
    queries: allQueries,
    fetchCourseQueries,
    addQuery,
    refreshQueries,
  } = useQueries();

  const [course, setCourse] = useState(null);
  const [courseQueries, setCourseQueries] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [queriesLoading, setQueriesLoading] = useState(false);
  const [expandedQueries, setExpandedQueries] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    if (!student || !id) return;
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const enrollmentRes = await axios.get(
          `https://stu-portal-backend.vercel.app/api/enrollments/student/${student._id}`,
        );
        const fetchedCourses = enrollmentRes.data.courses || [];
        const found = fetchedCourses.find((c) => c._id === id || c.id === id);
        if (found) {
          setCourse(found);
          setError("");
        } else {
          setError("You are not enrolled in this course.");
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Failed to load course information.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [student, id]);

  useEffect(() => {
    if (!student || !id) return;
    const fetchTeacherDetails = async () => {
      try {
        const teacherRes = await axios.get(
          `https://stu-portal-backend.vercel.app/api/auth/teacher/${id}`,
        );
        setTeacher(teacherRes.data.teacher);
      } catch (error) {
        console.log("Error fetching teacher:", error);
      }
    };
    fetchTeacherDetails();
  }, [student, id]);

  useEffect(() => {
    if (!student || !id || !course) return;
    const loadCourseQueries = async () => {
      try {
        setQueriesLoading(true);
        const filtered = allQueries.filter(
          (q) =>
            q.course_id === id &&
            (q.student_id === student._id || q.student === student._id),
        );
        if (filtered.length > 0) {
          setCourseQueries(filtered);
        } else {
          const fetched = await fetchCourseQueries(id);
          setCourseQueries(fetched || []);
        }
      } catch (error) {
        console.error("Error loading course queries:", error);
      } finally {
        setQueriesLoading(false);
      }
    };
    loadCourseQueries();
  }, [student, id, course, allQueries, fetchCourseQueries]);

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    if (!queryText.trim() || !student || !course || !teacher) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        student_id: student._id,
        course_id: course._id,
        query: queryText.trim(),
        teacher_id: teacher._id,
      };
      const response = await axios.post(
        `https://stu-portal-backend.vercel.app/api/queries/create`,
        payload,
        { withCredentials: true },
      );
      const newQuery = response.data.query || response.data;
      if (addQuery) addQuery(newQuery);
      setCourseQueries((prev) => [newQuery, ...prev]);
      setIsModalOpen(false);
      setQueryText("");
      if (refreshQueries) refreshQueries();
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError(err.response?.data?.msg || "Failed to submit query.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAnswer = (queryId, e) => {
    e.stopPropagation();
    setExpandedQueries((prev) => ({
      ...prev,
      [queryId]: !prev[queryId],
    }));
  };

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return {
          icon: CheckCircle,
          color: "text-emerald-700",
          bg: "bg-emerald-50 border border-emerald-200",
          dot: "bg-emerald-500",
          label: "Resolved",
        };
      case "pending":
        return {
          icon: ClockIcon,
          color: "text-amber-700",
          bg: "bg-amber-50 border border-amber-200",
          dot: "bg-amber-500",
          label: "Pending",
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-red-700",
          bg: "bg-red-50 border border-red-200",
          dot: "bg-red-500",
          label: "Rejected",
        };
      default:
        return {
          icon: ClockIcon,
          color: "text-slate-600",
          bg: "bg-slate-50 border border-slate-200",
          dot: "bg-slate-400",
          label: status || "Pending",
        };
    }
  };

  if (!student)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <GraduationCap className="h-10 w-10 text-indigo-400" />
          </div>
          <p className="text-slate-600 font-semibold text-lg">
            Please log in to view this page.
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Your session may have expired.
          </p>
        </div>
      </div>
    );

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-slate-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm font-medium">
            Loading course...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-red-100 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-7 w-7 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Access Denied
          </h3>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );

  if (!course)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <BookOpen className="h-10 w-10 text-indigo-400" />
          </div>
          <p className="text-slate-600 font-semibold text-lg">
            Course not found.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top spacing for stats */}
      <div className="pt-6 pb-2">
        <StatsCard queries={courseQueries} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* ── Navigation Bar ── */}
        <div className="flex items-center justify-between py-5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 font-semibold transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </Link>

          {teacher && (
            <button
              onClick={() => router.push(`/dashboard/teacher/${teacher._id}`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-100 hover:border-indigo-200 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              <Calendar1 className="h-4 w-4" />
              Meeting with {teacher.name}
            </button>
          )}
        </div>

        {/* ── Hero Header Card ── */}
        <div className="relative mb-8 group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-md opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
          <div className="relative bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Gradient Header */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 px-8 py-10 relative overflow-hidden">
              {/* Decorative blobs */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Left: Course Info */}
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/25 shadow-inner">
                    <BookOpen className="h-9 w-9 text-white" />
                  </div>
                  <div className="pt-0.5">
                    <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full text-[10px] font-bold text-white/90 uppercase tracking-widest mb-3">
                      Active Course
                    </span>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none mb-3">
                      {course.title || course.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="flex items-center gap-1.5 text-indigo-100">
                        <User className="h-3.5 w-3.5 opacity-70" />
                        <span className="text-sm font-medium">
                          {teacher ? teacher.name : "Faculty Member"}
                        </span>
                      </div>
                      <div className="w-1 h-1 bg-white/30 rounded-full hidden sm:block"></div>
                      <div className="flex items-center gap-1.5 text-indigo-100">
                        <Hash className="h-3.5 w-3.5 opacity-70" />
                        <span className="text-sm font-medium">
                          {course.code}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: CTA */}
                <div className="flex-shrink-0">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2.5 px-6 py-3 bg-white hover:bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 active:scale-95 shadow-xl shadow-black/20 group/btn"
                  >
                    <Plus className="h-4.5 w-4.5 group-hover/btn:rotate-90 transition-transform" />
                    Ask New Query
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Strip */}
            <div className="px-8 py-4 bg-white border-t border-slate-100 flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-indigo-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 leading-none">
                    {courseQueries.length}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Total Queries
                  </p>
                </div>
              </div>
              <div className="w-px h-8 bg-slate-100"></div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 leading-none">
                    {
                      courseQueries.filter((q) => q.status === "resolved")
                        .length
                    }
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Resolved
                  </p>
                </div>
              </div>
              <div className="w-px h-8 bg-slate-100"></div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                  <ClockIcon className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 leading-none">
                    {
                      courseQueries.filter(
                        (q) => q.status === "pending" || !q.status,
                      ).length
                    }
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Pending
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left Sidebar ── */}
          <div className="lg:col-span-1 space-y-5">
            {/* Schedule Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-indigo-100 hover:shadow-md transition-all duration-300">
              <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <BookMarked className="h-4 w-4 text-indigo-600" />
                </div>
                Schedule & Details
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-xl hover:bg-indigo-50/50 transition-colors">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 flex-shrink-0">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Meeting Days
                    </p>
                    <p className="text-slate-800 font-bold text-sm">
                      {course.days || "Mon, Wed, Fri"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-xl hover:bg-indigo-50/50 transition-colors">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 flex-shrink-0">
                    <ClockIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Lecture Time
                    </p>
                    <p className="text-slate-800 font-bold text-sm">
                      {course.time || "10:00 – 11:30 AM"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrollment ID Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden group/enroll shadow-lg">
              <div className="absolute top-3 right-3 opacity-[0.07] group-hover/enroll:opacity-[0.12] transition-opacity">
                <GraduationCap className="w-20 h-20" />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <Users className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  Enrollment ID
                </h3>
              </div>
              <p className="text-2xl font-mono font-extrabold tracking-wider text-white relative z-10">
                #{student.rollNumber || student._id.slice(-6)}
              </p>
              <p className="text-[10px] text-slate-500 mt-1.5 uppercase font-bold tracking-widest relative z-10">
                Verified Student Access
              </p>
            </div>
          </div>

          {/* ── Main Queries Panel ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-indigo-600" />
                    Engagement Portal
                  </h2>
                  <p className="text-slate-400 text-sm mt-0.5">
                    Your personal academic discussion board
                  </p>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-indigo-200 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  New Query
                </button>
              </div>

              {/* Queries Body */}
              <div className="p-6 min-h-[380px]">
                {queriesLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="h-10 w-10 rounded-full border-[3px] border-slate-100 border-t-indigo-600 animate-spin"></div>
                    <p className="text-slate-400 font-medium text-sm">
                      Syncing doubts...
                    </p>
                  </div>
                ) : courseQueries.length > 0 ? (
                  <div className="space-y-3">
                    {courseQueries.map((query) => {
                      const statusInfo = getStatusInfo(query.status);
                      const StatusIcon = statusInfo.icon;
                      const isExpanded = expandedQueries[query._id];

                      return (
                        <div
                          key={query._id}
                          className={`border rounded-xl overflow-hidden transition-all duration-300 group/query ${
                            isExpanded
                              ? "border-indigo-200 shadow-md ring-1 ring-indigo-50"
                              : "border-slate-100 hover:border-slate-200 hover:shadow-sm"
                          }`}
                        >
                          {/* Query Row */}
                          <div
                            className="p-5 bg-white cursor-pointer select-none"
                            onClick={(e) => toggleAnswer(query._id, e)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                {/* Status + Date */}
                                <div className="flex items-center gap-2.5 mb-2.5">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${statusInfo.bg} ${statusInfo.color}`}
                                  >
                                    <StatusIcon className="h-3 w-3" />
                                    {statusInfo.label}
                                  </span>
                                  <span className="text-[11px] text-slate-300 font-medium">
                                    {new Date(
                                      query.createdAt,
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                                {/* Query Text */}
                                <p className="text-slate-800 font-semibold text-base leading-snug group-hover/query:text-indigo-600 transition-colors line-clamp-2">
                                  {query.query}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                      `/dashboard/my-query/${query._id}`,
                                    );
                                  }}
                                  className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all opacity-0 group-hover/query:opacity-100"
                                  title="View Full Query"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => toggleAnswer(query._id, e)}
                                  className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"
                                  title={isExpanded ? "Collapse" : "Expand"}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expanded: Answer */}
                          {isExpanded && (
                            <div className="px-5 pb-5 pt-0 bg-slate-50/50 animate-slide-down border-t border-slate-100">
                              {query.answer ? (
                                <div className="mt-4 bg-white rounded-xl p-5 border border-indigo-50 shadow-sm">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-[11px] font-bold text-white uppercase flex-shrink-0">
                                      {teacher ? teacher.name[0] : "F"}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-900 leading-none">
                                        {teacher ? teacher.name : "Faculty"}
                                      </p>
                                      <p className="text-[11px] text-slate-400 mt-0.5">
                                        Faculty Response
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-slate-600 leading-relaxed text-sm border-l-2 border-indigo-200 pl-4 italic">
                                    {query.answer}
                                  </p>
                                </div>
                              ) : (
                                <div className="mt-4 flex items-center justify-center gap-2.5 py-4">
                                  <div className="flex gap-1">
                                    <div
                                      className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                                      style={{ animationDelay: "0ms" }}
                                    ></div>
                                    <div
                                      className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce"
                                      style={{ animationDelay: "150ms" }}
                                    ></div>
                                    <div
                                      className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce"
                                      style={{ animationDelay: "300ms" }}
                                    ></div>
                                  </div>
                                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    Awaiting Faculty Response
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 border border-slate-100">
                      <MessageSquare className="h-7 w-7 text-slate-300" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1.5">
                      No Discussions Yet
                    </h3>
                    <p className="text-slate-400 text-sm text-center max-w-xs leading-relaxed mb-6">
                      Have a doubt? Start a conversation with your faculty
                      member.
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Ask First Query
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-none">
                    New Academic Query
                  </h3>
                  <p className="text-indigo-200 text-xs mt-0.5">
                    {course.title || course.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitQuery} className="p-6">
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                  Your Question
                </label>
                <textarea
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  className="w-full p-4 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300 outline-none transition-all resize-none text-slate-800 placeholder-slate-400 text-sm leading-relaxed"
                  rows="4"
                  placeholder="Describe your doubt clearly..."
                  required
                />
                <p className="text-xs text-slate-400 mt-2">
                  {queryText.length > 0
                    ? `${queryText.length} characters`
                    : "Be specific for a faster response."}
                </p>
              </div>

              {submitError && (
                <div className="mb-4 p-3.5 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
                  {submitError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-slate-600 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !queryText.trim()}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-7 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Sending..." : "Post Query"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
