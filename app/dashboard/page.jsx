"use client";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { useStudent } from "@/app/context/StudentContext";
import CourseCard from "@/component/CourseCard";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const { student } = useStudent();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    const fetchEnrolledCourses = async () => {
      try {
        const enrollmentRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/enrollments/student/${student._id}`,
        );
        setEnrolledCourses(enrollmentRes.data.courses || []);
      } catch (error) {
        console.error("Error fetching enrolled courses", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolledCourses();
  }, [student]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ── Hero Welcome Card ── */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />

          {/* Decorative blobs */}
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-24 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-indigo-400/10 rounded-full blur-xl pointer-events-none" />

          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 px-8 py-10 md:py-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              {/* Greeting tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full mb-4">
                <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                <span className="text-[11px] font-bold text-white/90 uppercase tracking-widest">
                  {getGreeting()}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none mb-3">
                {student?.name || "Student"} 👋
              </h1>
              <p className="text-indigo-100 text-sm max-w-md leading-relaxed">
                Track your academic queries, get updates on your requests, and
                stay connected with your instructors.
              </p>
            </div>

            {/* Stats quick-view */}
            <div className="flex gap-3 flex-shrink-0">
              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 text-center min-w-[80px]">
                <p className="text-2xl font-extrabold text-white leading-none">
                  {enrolledCourses.length}
                </p>
                <p className="text-[11px] text-indigo-200 font-semibold mt-1 uppercase tracking-wider">
                  Courses
                </p>
              </div>
              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 text-center min-w-[80px]">
                <p className="text-2xl font-extrabold text-white leading-none">
                  0
                </p>
                <p className="text-[11px] text-indigo-200 font-semibold mt-1 uppercase tracking-wider">
                  Pending
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: BookOpen,
              label: "Enrolled Courses",
              value: enrolledCourses.length,
              iconBg: "bg-indigo-50",
              iconColor: "text-indigo-600",
              valueBg: "text-indigo-700",
              border: "border-indigo-100",
            },
            {
              icon: TrendingUp,
              label: "Active Sessions",
              value: 0,
              iconBg: "bg-emerald-50",
              iconColor: "text-emerald-600",
              valueBg: "text-emerald-700",
              border: "border-emerald-100",
            },
            {
              icon: Clock,
              label: "Pending Queries",
              value: 0,
              iconBg: "bg-amber-50",
              iconColor: "text-amber-600",
              valueBg: "text-amber-700",
              border: "border-amber-100",
            },
            {
              icon: CheckCircle,
              label: "Resolved",
              value: 0,
              iconBg: "bg-blue-50",
              iconColor: "text-blue-600",
              valueBg: "text-blue-700",
              border: "border-blue-100",
            },
          ].map(
            ({
              icon: Icon,
              label,
              value,
              iconBg,
              iconColor,
              valueBg,
              border,
            }) => (
              <div
                key={label}
                className={`bg-white rounded-2xl p-5 border ${border} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
                </div>
                <p
                  className={`text-2xl font-extrabold ${valueBg} leading-none mb-1`}
                >
                  {value}
                </p>
                <p className="text-xs text-slate-400 font-semibold">{label}</p>
              </div>
            ),
          )}
        </div>

        {/* ── Enrolled Courses ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Section header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  My Enrolled Courses
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {enrolledCourses.length} course
                  {enrolledCourses.length !== 1 ? "s" : ""} enrolled
                </p>
              </div>
            </div>
            {enrolledCourses.length > 0 && (
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold border border-indigo-100">
                {enrolledCourses.length} Active
              </span>
            )}
          </div>

          {/* Course content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 border-t-indigo-600 mx-auto mb-4" />
                <p className="text-slate-400 text-sm font-medium">
                  Loading your courses...
                </p>
              </div>
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 border border-slate-100">
                <GraduationCap className="h-7 w-7 text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                No Courses Yet
              </h3>
              <p className="text-slate-400 text-sm text-center max-w-xs leading-relaxed">
                You are not enrolled in any courses yet. Contact your instructor
                to get started.
              </p>
            </div>
          ) : (
            <div className="p-6">
              {/* Horizontal scroll on mobile, grid on desktop */}
              <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible snap-x snap-mandatory md:snap-none">
                {enrolledCourses.map((course) => (
                  <div
                    key={course._id}
                    className="snap-start flex-shrink-0 w-72 md:w-auto"
                  >
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
