"use client";
import { GraduationCap, BookOpen, RefreshCw, AlertCircle, CalendarDays } from "lucide-react";
import { useStudent } from "@/app/context/StudentContext";
import CourseCard from "@/component/CourseCard";
import { useEffect, useState } from "react";
import api from "@/app/lib/api";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { student, loading: studentLoading } = useStudent();

  const fetchEnrolledCourses = async () => {
    if (!student) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/enrollments/student/${student._id}`);
      setEnrolledCourses(res.data.courses || []);
    } catch {
      setError("Failed to load your courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, [student]);

  const firstName = student?.name?.split(" ")[0] || "Student";
  const totalCourses = enrolledCourses.length;

  if (studentLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-0">
        <div className="bg-white rounded-2xl h-40 animate-pulse border border-slate-100" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-100 rounded-xl h-24 animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-6 w-40 bg-slate-100 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-100 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-0">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <p className="text-rose-700 font-medium">{error}</p>
          <button
            onClick={fetchEnrolledCourses}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-sm transition"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Quick stats data
  const stats = [
    { label: "Active Courses", value: totalCourses, icon: BookOpen, color: "text-blue-600 bg-blue-50" },
    { label: "Completed", value: "—", icon: GraduationCap, color: "text-emerald-600 bg-emerald-50" },
    { label: "In Progress", value: totalCourses, icon: CalendarDays, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto space-y-7 px-4 sm:px-0"
    >
      {/* Welcome card (clean white) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                Welcome back, {firstName}
              </h1>
              <p className="text-slate-500 text-sm mt-1">Continue your learning journey</p>
            </div>
            <div className="bg-slate-50 rounded-lg px-5 py-2.5 text-center border border-slate-100">
              <p className="text-2xl font-bold text-slate-800">{totalCourses}</p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Enrolled Courses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between"
          >
            <div>
              <p className="text-slate-400 text-[11px] uppercase tracking-wider font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
            </div>
            <div className={`${stat.color} p-2.5 rounded-lg`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Courses section */}
      <div className="space-y-5">
        <div className="flex items-end justify-between border-b border-slate-100 pb-3 flex-wrap gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Active Enrollments</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {totalCourses} Registered {totalCourses === 1 ? "Course" : "Courses"}
            </p>
          </div>
          <button
            onClick={fetchEnrolledCourses}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>

        {totalCourses === 0 ? (
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6 text-slate-300" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700 mb-1">No courses enrolled yet</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Stay tuned! Your courses will appear here once enrollment is processed.
            </p>
            <button
              onClick={fetchEnrolledCourses}
              className="mt-5 text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Check again
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {enrolledCourses.map((course, i) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                whileHover={{ y: -2 }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}