"use client";
import { useEffect, useState } from "react";
import { useStudent } from "@/app/context/StudentContext";
import api from "@/app/lib/api";
import Loading from "@/component/Loading";
import Error from "@/component/Error";
import { motion } from "framer-motion";
import { Bell, Calendar, Megaphone } from "lucide-react";

export default function NoticesPage() {
  const { student } = useStudent();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllNotices = async () => {
    if (!student) return;
    try {
      setLoading(true);
      setError(null);
      // 1. Get enrolled courses
      const enrollmentRes = await api.get(`/enrollments/student/${student._id}`);
      const courses = enrollmentRes.data.courses || [];
      
      // 2. For each course, find teacher and get announcements
      const allAnnouncements = [];
      
      await Promise.all(courses.map(async (course) => {
        try {
          // Get teacher for this course
          const teacherRes = await api.get(`/auth/teacher/${course._id}`);
          const teacher = teacherRes.data.teacher;
          
          if (teacher) {
            // Get announcements for this teacher and course
            const annRes = await api.get(`/announcements/${teacher._id}/course/${course._id}`);
            const announcements = Array.isArray(annRes.data) ? annRes.data : [];
            
            announcements.forEach(ann => {
              allAnnouncements.push({
                ...ann,
                courseName: course.title || course.name,
                teacherName: teacher.name
              });
            });
          }
        } catch (err) {
          console.error(`Error fetching notices for course ${course._id}:`, err);
        }
      }));
      
      // Sort by date descending
      allAnnouncements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotices(allAnnouncements);
    } catch (err) {
      setError("Failed to load notices. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNotices();
  }, [student]);

  if (loading) return <Loading message="Syncing your notices..." />;
  if (error) return <Error message={error} onRetry={fetchAllNotices} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-4 mb-2">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-100 border border-blue-500">
          <Megaphone className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">Teacher Notices</h1>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Global Academic Announcements</p>
        </div>
      </div>

      <div className="h-px bg-linear-to-r from-gray-200 to-transparent w-full mb-8" />

      {notices.length === 0 ? (
        <div className="bg-white rounded-4xl border border-dashed border-gray-200 py-32 text-center shadow-inner">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-sm">
            <Bell className="w-10 h-10 text-gray-200" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">You're all caught up!</h3>
          <p className="text-gray-400 max-w-sm mx-auto text-sm leading-relaxed">
            When your instructors post important updates or announcements, they will appear here in chronological order.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {notices.map((notice, i) => (
            <motion.div
              key={notice._id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:border-blue-100 group relative overflow-hidden"
            >
                {/* Decorative glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50/50 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">
                      {notice.courseName}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(notice.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                  <p className="text-gray-800 text-base leading-relaxed font-bold tracking-tight">
                    {notice.text}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 bg-sky-50/50 px-5 py-4 rounded-3xl border border-sky-100 shrink-0 self-start md:self-center">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sm font-black text-blue-600 border border-sky-200 shadow-sm uppercase">
                    {notice.teacherName?.[0]}
                  </div>
                  <div>
                    <p className="text-[10px] text-sky-400 font-black uppercase tracking-widest mb-0.5">Instructor</p>
                    <p className="text-sm font-black text-blue-900">{notice.teacherName}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
