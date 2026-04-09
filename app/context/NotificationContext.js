"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { socket } from "../lib/socket";
import toast from "react-hot-toast";
import { useStudent } from "./StudentContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { student } = useStudent();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  // keep latest pathname
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // better path compare
  const shouldShowNotification = (currentPath, notificationPage) => {
    if (!notificationPage) return true;
    const normalize = (p) => p.replace(/\/+$/, "") || "/";
    return normalize(currentPath) !== normalize(notificationPage);
  };

  // load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("notifications");
    if (saved) setNotifications(JSON.parse(saved));
  }, []);

  // save to localStorage
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const handleRemove = (data) => {
      setNotifications((prev) => prev.filter((n) => n.id !== data._id));
    };

    const handleNew = (data, type) => {
      // ✅ 1. ignore self message
      if (
        student?._id &&
        (data.sender_id === student._id ||
          (type === "message" && data.sender_role === "student"))
      ) {
        return;
      }

      // ✅ 2. resolve target page
      let targetPage = data.page || data.targetRoute;

      if (!targetPage) {
        if (type === "message" || type === "query") {
          // Fallback using query_id or student_id/teacher_id context
          const slug = data.query_id || data.student_id || data._id;
          targetPage = slug ? `/student/chat/${slug}` : "/student/chat";
        } else if (type === "announcement") {
          targetPage = "/student/announcements";
        }
      }
console.log(data);

      const formatted = {
        id: data._id,
        type,
        text: data.message || data.query || data.text ||  "New Notification",
        time: data.createdAt,
        read: false,
        page: targetPage,
      };

      setNotifications((prev) => [formatted, ...prev]);

      // ✅ 3. toast only if not on same page
      if (shouldShowNotification(pathnameRef.current, targetPage)) {
        if (type === "announcement") {
          toast.success("New Announcement from Admin");
        } else if (type === "query") {
          toast.success("New Query Reply from Teacher");
        } else if (type === "message") {
          toast.success("New Message from Teacher");
        }
      }
    };

    socket.on("new_announcement", (d) => handleNew(d, "announcement"));
    socket.on("update_announcement", (d) => handleNew(d, "announcement"));
    socket.on("delete_announcement", handleRemove);
    socket.on("update_query", (d) => handleNew(d, "query"));
    socket.on("new_message", (d) => handleNew(d, "message"));

    return () => {
      socket.off("new_announcement");
      socket.off("update_announcement");
      socket.off("delete_announcement");
      socket.off("update_query");
      socket.off("new_message");
    };
  }, [student?._id]);

  // mark single as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  // mark all as read and clear from storage
  const markAllAsRead = () => {
    setNotifications([]);
    localStorage.removeItem("notifications");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, markAsRead, markAllAsRead, unreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
