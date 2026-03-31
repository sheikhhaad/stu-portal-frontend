"use client";
import { useEffect, useState } from "react";
import { useStudent } from "@/app/context/StudentContext";
import api from "@/app/lib/api";
import Loading from "@/component/Loading";
import Error from "@/component/Error";
import { motion } from "framer-motion";
import { Bell, Calendar, Megaphone } from "lucide-react";
import socket from "@/app/lib/socket";

export default function NoticesPage() {
  const { student } = useStudent();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllNotices = async () => {
    if (!student?._id) return;

    try {
      setLoading(true);
      setError(null);

      // 1. get enrolled courses
      const enrollmentRes = await api.get(
        `/enrollments/student/${student._id}`,
      );
      const courses = enrollmentRes.data.courses || [];

      const courseIds = courses.map((c) => c._id);

      // 2. get all announcements (single call)
      const annRes = await api.get(`/announcements`);
      const allAnnouncements = Array.isArray(annRes.data) ? annRes.data : [];

      // 3. filter by course_id
      const filtered = allAnnouncements
        .filter((ann) => courseIds.includes(ann.course_id))
        .map((ann) => {
          const course = courses.find((c) => c._id === ann.course_id);

          return {
            ...ann,
            courseName: course?.title || course?.name,
          };
        });

      // 4. sort
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setNotices(filtered);
    } catch {
      setError("Failed to load notices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    socket.on("receiveNotification", (data) => {
      console.log("New Notification:", data);
    });
  }, []);

  useEffect(() => {
    fetchAllNotices();

    // NEW announcement
    socket.on("new_announcement", (data) => {
      setNotices((prev) => [data, ...prev]);
    });

    // UPDATE
    socket.on("update_announcement", (updated) => {
      setNotices((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item)),
      );
    });

    // DELETE
    socket.on("delete_announcement", ({ id }) => {
      setNotices((prev) => prev.filter((item) => item._id !== id));
    });

    return () => {
      socket.off("new_announcement");
      socket.off("update_announcement");
      socket.off("delete_announcement");
    };
  }, [student]);

  if (loading) return <Loading message="Syncing your notices..." />;
  if (error) return <Error message={error} onRetry={fetchAllNotices} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-8xl mx-auto  space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
          <Megaphone className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-gray-900 leading-tight">
            Teacher Notices
          </h1>
          <p className="text-xs text-gray-400">
            Academic announcements from your instructors
          </p>
        </div>
      </div>

      {/* Empty state */}
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
        <div className="flex flex-col gap-3">
          {notices.map((notice, i) => (
            <motion.div
              key={notice._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:border-blue-100 hover:shadow-sm transition-all"
            >
              {/* Top row: course badge + date */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-[11px] font-medium">
                  {notice.courseName}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(notice.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Notice text */}
              <p className="text-sm text-gray-800 leading-relaxed mb-3">
                {notice.text}
              </p>

              {/* Instructor row */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-xs font-semibold text-blue-600 shrink-0 uppercase">
                  {notice.teacherName?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 leading-none mb-0.5">
                    Instructor
                  </p>
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {notice.teacherName}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
