"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import socket from "@/app/lib/socket";
import { useStudent } from "./StudentContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { student } = useStudent();

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
    if (!student?._id) return;

    socket.connect();
    socket.emit("join", student._id);

    // 1. New Message
    const handleReceiveMessage = (data) => {
      // Only notify if it's NOT from the current student (sanity check)
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
      // Check if it's a student's query and it has a reply
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

    socket.on("receive_message", handleReceiveMessage);
    socket.on("new_announcement", handleNewAnnouncement);
    socket.on("update_announcement", handleUpdateAnnouncement);
    socket.on("update_query", handleUpdateQuery);
    socket.on("update_session_status", handleUpdateSessionStatus);
    socket.on("slot_deleted_with_sessions", handleSlotDeleted);
    socket.on("receiveNotification", handleGeneralNotification); // From notices/page.jsx & Backend

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("new_announcement", handleNewAnnouncement);
      socket.off("update_announcement", handleUpdateAnnouncement);
      socket.off("update_query", handleUpdateQuery);
      socket.off("update_session_status", handleUpdateSessionStatus);
      socket.off("slot_deleted_with_sessions", handleSlotDeleted);
      socket.off("receiveNotification", handleGeneralNotification);
      socket.disconnect();
    };
  }, [student?._id, addNotification]);

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
