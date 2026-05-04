"use client";
import { useEffect, useState, useCallback } from "react";
import { useStudent } from "@/app/context/StudentContext";
import { useEnrollMent } from "@/app/context/TeacherEnroll";
import api from "@/app/lib/api";
import { motion } from "framer-motion";
import { Bell, Calendar, Megaphone, Info } from "lucide-react";
import { socket } from "@/app/lib/socket";

export default function NoticesPage() {
  const { student } = useStudent();
  const { course: enrolledCourses, loading: enrollLoading } = useEnrollMent();
  const [notices, setNotices] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Helper: add course name to an announcement
  const enrichAnnouncement = useCallback(
    (ann) => {
      const course = enrolledCourses.find((c) => c._id === ann.course_id);
      return {
        ...ann,
        courseName: course?.title || course?.name || "Unknown Course",
      };
    },
    [enrolledCourses],
  );

  // Helper: check if an announcement belongs to the student
  const isForStudent = useCallback(
    (ann) => enrolledCourses.some((c) => c._id === ann.course_id),
    [enrolledCourses],
  );

  // Fetch all notices (initial load)
  const fetchAllNotices = useCallback(async () => {
    if (!student?._id || !enrolledCourses) return;
    try {
      const courseIds = enrolledCourses.map((c) => c._id);

      // 2. get all announcements
      const annRes = await api.get(`/announcements`);
      const allAnnouncements = Array.isArray(annRes.data) ? annRes.data : [];

      // 3. filter and enrich
      let filtered = allAnnouncements
        .filter((ann) => courseIds.includes(ann.course_id))
        .map((ann) => {
          const course = enrolledCourses.find((c) => c._id === ann.course_id);
          return { ...ann, courseName: course?.title || course?.name };
        });

      // 4. sort (newest first)
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotices(filtered);
    } catch (err) {
      console.error("Failed to load notices", err);
    } finally {
      setIsInitialLoading(false);
    }
  }, [student?._id, enrolledCourses]);

  // ---- Socket listeners (real-time) ----
  useEffect(() => {
    if (!student?._id || !enrolledCourses || enrolledCourses.length === 0)
      return;

    if (!socket.connected) socket.connect();

    // Handle new announcement
    const handleNew = (data) => {
      if (isForStudent(data)) {
        const enriched = enrichAnnouncement(data);
        setNotices((prev) => {
          if (prev.some((n) => n._id === enriched._id)) return prev;
          const updated = [enriched, ...prev];
          updated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          return updated;
        });
      }
    };

    // Handle delete announcement (receives { id })
    const handleDelete = ({ id }) => {
      setNotices((prev) => prev.filter((n) => n._id !== id));
    };

    // Handle update announcement (receives full updated object)
    const handleUpdate = (updatedAnnouncement) => {
      if (isForStudent(updatedAnnouncement)) {
        const enriched = enrichAnnouncement(updatedAnnouncement);
        setNotices((prev) => {
          const exists = prev.some((n) => n._id === enriched._id);
          if (!exists) return prev; // should exist, but just in case
          const updatedList = prev.map((n) =>
            n._id === enriched._id ? enriched : n,
          );
          updatedList.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );
          return updatedList;
        });
      } else {
        // If updated announcement no longer belongs to student, remove it
        setNotices((prev) =>
          prev.filter((n) => n._id !== updatedAnnouncement._id),
        );
      }
    };

    socket.on("new_announcement", handleNew);
    socket.on("delete_announcement", handleDelete);
    socket.on("update_announcement", handleUpdate);

    return () => {
      socket.off("new_announcement", handleNew);
      socket.off("delete_announcement", handleDelete);
      socket.off("update_announcement", handleUpdate);
    };
  }, [student?._id, enrolledCourses, enrichAnnouncement, isForStudent]);

  // Initial data load
  useEffect(() => {
    if (enrolledCourses.length > 0 || !enrollLoading) {
      fetchAllNotices();
    }
  }, [fetchAllNotices, enrolledCourses, enrollLoading]);

  if (isInitialLoading || enrollLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-0">
        <div className="bg-white rounded-2xl h-32 animate-pulse border border-slate-100" />
        <div className="space-y-4">
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

  const stats = [
    {
      label: "Total Notices",
      value: notices.length,
      icon: Megaphone,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Active Courses",
      value: enrolledCourses.length,
      icon: Info,
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
      {/* Welcome/Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h1 className="text-xl font-bold text-slate-800">Teacher Notices</h1>
        <p className="text-slate-500 text-sm mt-1">
          Academic announcements from your instructors
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
              <p className="text-xs text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <div className={`${stat.color} p-2 rounded-lg`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {notices.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 py-14 text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 border border-gray-100">
            <Bell className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            You're all caught up!
          </p>
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            Instructor announcements will appear here in chronological order.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {notices.map((notice, i) => (
            <motion.div
              key={notice._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="bg-white rounded-xl border border-slate-100 p-5 hover:border-blue-100 hover:shadow-md transition-all group"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  {notice.courseName}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(notice.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors">
                {notice.text}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
