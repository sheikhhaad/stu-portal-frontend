"use client";
import { GraduationCap } from "lucide-react";
import { useStudent } from "@/app/context/StudentContext";
import CourseCard from "@/component/CourseCard";
import { useEffect, useState } from "react";
import api from "@/app/lib/api";
import Loading from "@/component/Loading";
import Error from "@/component/Error";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  let { student } = useStudent()
  const fetchEnrolledCourses = async () => {
    if (!student) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/enrollments/student/${student._id}`);
      setEnrolledCourses(res.data.courses || []);
    } catch (err) {
      setError("Failed to load your courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, [student]);

  if (loading) return <Loading message="Preparing your dashboard..." />;
  if (error) return <Error message={error} onRetry={fetchEnrolledCourses} />;

  const firstName = student?.name?.split(" ")[0] || "Student";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Welcome banner */}
      <div className="relative rounded-3xl overflow-hidden bg-blue-600 border border-blue-500 shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-300/30 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -ml-32 -mb-32" />

        <div className="relative px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/10 border border-sky-400/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
              </span>
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Live Academic Status</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-400 to-blue-100">{firstName}</span>
            </h2>

          </div>


        </div>
      </div>

      {/* Quick Stats */}

      {/* Courses section */}
      <div className="space-y-6">
        <div className="flex items-end justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Active Enrollments</h3>
            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">
              {enrolledCourses.length} Registered Courses
            </p>
          </div>
          <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">
            View All
          </button>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
              <GraduationCap className="w-10 h-10 text-gray-200" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2 mt-2">No courses enrolled yet</h4>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Stay tuned! Your courses will appear here once the administration processes your enrollment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {enrolledCourses.map((course, i) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
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
