"use client";
import { useEffect, useState, useCallback } from "react";
import { useStudent } from "@/app/context/StudentContext";
import api from "@/app/lib/api";
import { motion } from "framer-motion";
import { Bell, Calendar, Megaphone } from "lucide-react";
import { socket } from "@/app/lib/socket";

export default function NoticesPage() {
  const { student } = useStudent();
  const [notices, setNotices] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
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
    if (!student?._id) return;
    try {
      // 1. get enrolled courses
      const enrollmentRes = await api.get(`/enrollments/student/${student._id}`);
      const courses = enrollmentRes.data.courses || [];
      setEnrolledCourses(courses);
      const courseIds = courses.map((c) => c._id);

      // 2. get all announcements
      const annRes = await api.get(`/announcements`);
      const allAnnouncements = Array.isArray(annRes.data) ? annRes.data : [];

      // 3. filter and enrich
      let filtered = allAnnouncements
        .filter((ann) => courseIds.includes(ann.course_id))
        .map((ann) => {
          const course = courses.find((c) => c._id === ann.course_id);
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
  }, [student?._id]);

  // ---- Socket listeners (real-time) ----
  useEffect(() => {
    if (!student?._id || enrolledCourses.length === 0) return;

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
            n._id === enriched._id ? enriched : n
          );
          updatedList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          return updatedList;
        });
      } else {
        // If updated announcement no longer belongs to student, remove it
        setNotices((prev) => prev.filter((n) => n._id !== updatedAnnouncement._id));
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
    fetchAllNotices();
  }, [fetchAllNotices]);

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-8xl mx-auto space-y-4"
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
              <p className="text-sm text-gray-800 leading-relaxed mb-3">
                {notice.text}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}