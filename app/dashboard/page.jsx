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
import api from "@/app/lib/api";
import Loading from "@/component/Loading";
import Error from "@/component/Error";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { student } = useStudent();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnrolledCourses = async () => {
    if (!student) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/enrollments/student/${student._id}`);
      setEnrolledCourses(res.data.courses || []);
    } catch (err) {
      console.error("Error fetching enrolled courses", err);
      setError("Failed to load your courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, [student]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) return <Loading message="Preparing your dashboard..." />;
  if (error) return <Error message={error} onRetry={fetchEnrolledCourses} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-slate-50/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ── Hero Welcome Card ── */}
        <div className="relative rounded-4xl overflow-hidden shadow-2xl shadow-indigo-100/50 group">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-600 via-indigo-700 to-purple-800" />
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute bottom-0 right-24 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 px-8 py-12 md:py-16 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full mb-6"
              >
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="text-xs font-black text-white uppercase tracking-widest">
                  {getGreeting()}
                </span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                {student?.name?.split(" ")[0] || "Student"} 👋
              </h1>
              <p className="text-indigo-100/90 text-lg font-medium max-w-md leading-relaxed">
                Your central hub for academic success. Manage courses, track
                queries, and collaborate with ease.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center min-w-[120px] shadow-lg">
                <p className="text-4xl font-black text-white">
                  {enrolledCourses.length}
                </p>
                <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider mt-2">
                  Courses
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center min-w-[120px] shadow-lg">
                <p className="text-4xl font-black text-white">0</p>
                <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider mt-2">
                  Active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: BookOpen,
              label: "Enrolled",
              value: enrolledCourses.length,
              color: "indigo",
            },
            {
              icon: TrendingUp,
              label: "Active Sessions",
              value: 0,
              color: "emerald",
            },
            { icon: Clock, label: "Pending", value: 0, color: "amber" },
            { icon: CheckCircle, label: "Resolved", value: 0, color: "blue" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-${stat.color}-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-tight">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── Courses Section ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-12">
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Enrolled Courses
                </h2>
                <p className="text-sm text-slate-400 font-bold">
                  {enrolledCourses.length} active enrollments
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {enrolledCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100">
                  <GraduationCap className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  No Courses Enrolled
                </h3>
                <p className="text-slate-400 font-bold text-center max-w-xs uppercase tracking-tight">
                  Stay tuned for upcoming courses
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
