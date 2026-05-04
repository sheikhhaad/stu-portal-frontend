"use client";

import {
  GraduationCap,
  BookOpen,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useStudent } from "@/app/context/StudentContext";
import { useEnrollMent } from "@/app/context/TeacherEnroll";
import CourseCard from "@/component/CourseCard";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { student, loading: studentLoading } = useStudent();
  const { course: uniqueCourses, loading: enrollLoading, error } = useEnrollMent();

  const firstName = student?.name || "Student";
  const totalCourses = uniqueCourses?.length || 0;

  // loading state
  if (studentLoading || enrollLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-0">
        <div className="bg-white rounded-2xl h-40 animate-pulse border border-slate-100" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-100 rounded-xl h-24 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-0">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <p className="text-rose-700 font-medium">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Active Courses",
      value: totalCourses,
      icon: BookOpen,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Enrolled",
      value: totalCourses,
      icon: GraduationCap,
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto space-y-7 px-4 sm:px-0"
    >
      {/* Welcome */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h1 className="text-xl font-bold text-slate-800">
          Welcome back, {firstName}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Continue your learning journey
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 border border-slate-100 flex justify-between"
          >
            <div>
              <p className="text-xs text-slate-400">
                {stat.label}
              </p>
              <p className="text-2xl font-bold">
                {stat.value}
              </p>
            </div>
            <div className={`${stat.color} p-2 rounded-lg`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {uniqueCourses?.map((course, i) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.05,
              duration: 0.2,
            }}
            whileHover={{ y: -2 }}
          >
            <CourseCard course={course} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}