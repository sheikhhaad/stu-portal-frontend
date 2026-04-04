"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import socket from "@/app/lib/socket";
import { useStudent } from "./StudentContext";
import { useEnrollMent } from "./TeacherEnroll";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { student } = useStudent();
  const { enrollMent } = useEnrollMent();

  const addNotification = useCallback((notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { 
      id, 
      type: "info", 
      duration: 5000, 
      ...notification 
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove
    if (newNotification.duration !== Infinity) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Socket.io Global Listeners & Connection Management
  useEffect(() => {
    if (!student?._id) {
      // No user — disconnect if connected
      if (socket.connected) {
        socket.disconnect();
      }
      return;
    }

    // Connect socket when user is authenticated
    if (!socket.connected) {
      socket.connect();
    }

    // Join user room + all chat rooms on connect (handles reconnects too)
    const handleConnect = () => {
      console.log("Socket connected, joining rooms for student:", student._id);
      
      // Join personal room
      socket.emit("join", student._id);

      // ✅ CRITICAL: Join ALL chat rooms so message notifications work on EVERY page
      // Without this, message notifications only work on the chat page
      if (enrollMent && enrollMent.length > 0) {
        enrollMent.forEach((teacher) => {
          const teacherId = teacher.teacher_id || teacher._id;
          if (teacherId) {
            const chatId = `${student._id}_${teacherId}`;
            socket.emit("join_chat", chatId);
            console.log("Joined global chat room:", chatId);
          }
        });
      }
    };

    // If already connected, join immediately
    if (socket.connected) {
      handleConnect();
    }

    // 1. New Message
    const handleReceiveMessage = (data) => {
      // Only notify if it's NOT from the current student
      if (data.sender_id !== student._id) {
        addNotification({
          type: "message",
          title: "New Message",
          message: data.message,
          icon: "MessageCircle",
        });
      }
    };

    // 2. New Announcement
    const handleNewAnnouncement = (data) => {
      addNotification({
        type: "announcement",
        title: "New Notice",
        message: data.text || "A new announcement has been posted.",
        icon: "Megaphone",
      });
    };

    // 2b. Updated Announcement
    const handleUpdateAnnouncement = (data) => {
      addNotification({
        type: "info",
        title: "Announcement Updated",
        message: data.text || "An existing announcement has been updated.",
        icon: "Megaphone",
      });
    };

    // 3. Query Update (Teacher reply)
    const handleUpdateQuery = (data) => {
      if (data.status === "resolved" || (data.replies && data.replies.length > 0)) {
        addNotification({
          type: "success",
          title: "Query Updated",
          message: "A teacher has replied to your query.",
          icon: "HelpCircle",
        });
      }
    };

    // 4. Session Update (Approved/Rejected)
    const handleUpdateSessionStatus = (data) => {
      addNotification({
        type: data.session.status === "accepted" ? "success" : "info",
        title: "Session Updated",
        message: data.session.status === "accepted" 
          ? "Your session has been approved! Check meeting link." 
          : `Session status: ${data.session.status}`,
        icon: "Calendar",
      });
    };

    // 5. Slot Deleted
    const handleSlotDeleted = (data) => {
      addNotification({
        type: "warning",
        title: "Session Cancelled",
        message: "A scheduled session slot was deleted by the teacher.",
        icon: "AlertTriangle",
      });
    };

    // 6. Catch-all Notification from Backend
    const handleGeneralNotification = (data) => {
      addNotification({
        type: data.type || "info",
        title: data.title || "Portal Update",
        message: data.message || data.text || "You have a new notification.",
        icon: data.icon || "Bell",
      });
    };

    socket.on("connect", handleConnect);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("new_announcement", handleNewAnnouncement);
    socket.on("update_announcement", handleUpdateAnnouncement);
    socket.on("update_query", handleUpdateQuery);
    socket.on("update_session_status", handleUpdateSessionStatus);
    socket.on("slot_deleted_with_sessions", handleSlotDeleted);
    socket.on("receiveNotification", handleGeneralNotification);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("new_announcement", handleNewAnnouncement);
      socket.off("update_announcement", handleUpdateAnnouncement);
      socket.off("update_query", handleUpdateQuery);
      socket.off("update_session_status", handleUpdateSessionStatus);
      socket.off("slot_deleted_with_sessions", handleSlotDeleted);
      socket.off("receiveNotification", handleGeneralNotification);
      socket.disconnect();
    };
  }, [student?._id, enrollMent, addNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
