"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import api from "@/app/lib/api";
import { useStudent } from "./StudentContext";
import { useEnrollMent } from "./TeacherEnroll";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { student } = useStudent();
  const { enrollMent } = useEnrollMent();

  const [teachersWithDetails, setTeachersWithDetails] = useState([]);
  const [fetchingTeachers, setFetchingTeachers] = useState(true);
  const [messages, setMessages] = useState([]);
  const [activeTeacherId, setActiveTeacherId] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false); // Add loading state

  // We use a ref to hold the actively viewed teacher ID to prevent dependency cycle in the polling mechanism.
  const activeTeacherRef = useRef(null);
  useEffect(() => {
    activeTeacherRef.current = activeTeacherId;
  }, [activeTeacherId]);

  // 1. Fetch enrolled teachers (Single source of truth)
  const fetchAllTeacherDetails = useCallback(async () => {
    if (!enrollMent || enrollMent.length === 0) {
      setFetchingTeachers(false);
      return;
    }

    try {
      setFetchingTeachers(true);
      const teacherPromises = enrollMent.map(async (teacher) => {
        const teacherId = teacher.teacher_id || teacher._id;
        try {
          const res = await api.get(`/enrollments/teacher/info/${teacherId}`);
          const teacherData = res.data?.teacher || res.data || {};

          return { ...teacher, teacherDetails: teacherData, teacherId };
        } catch (error) {
          console.error(`Error fetching teacher ${teacherId}:`, error);
          return { ...teacher, teacherDetails: teacher, teacherId };
        }
      });

      const teachersWithInfo = await Promise.all(teacherPromises);
      setTeachersWithDetails(teachersWithInfo);
    } catch (error) {
      console.error("Error fetching teacher details:", error);
    } finally {
      setFetchingTeachers(false);
    }
  }, [enrollMent]);

  // Only run when enrollMent explicitly changes
  useEffect(() => {
    fetchAllTeacherDetails();
  }, [fetchAllTeacherDetails]);

  // 2. Optimized Generic Teacher Fetcher to fix "Refresh on Chat page" bug.
  const getOrFetchTeacherDetails = useCallback(async (teacherId) => {
    if (!teacherId) return null;

    const cached = teachersWithDetails.find(
      (t) => t.teacherId === teacherId || t._id === teacherId
    );
    if (cached) return cached;

    try {
      const res = await api.get(`/enrollments/teacher/info/${teacherId}`);
      return res.data?.teacher || res.data;
    } catch (error) {
      console.error("Error fetching single teacher fallback:", error);
      return null;
    }
  }, [teachersWithDetails]);

  // 3. Optimized Message Fetcher - FIXED: Use correct endpoint format like teacher portal
  const fetchMessages = useCallback(async (targetTeacherId) => {
    if (!student?._id || !targetTeacherId) return;

    try {
      setLoadingMessages(true);
      // FIXED: Use the same endpoint pattern as teacher portal
      // Teacher uses: /api/messages/${studentId}/${teacher._id}
     
      const res = await api.get(`/messages/${student._id}/${targetTeacherId}`);
      
      if (res.data && Array.isArray(res.data)) {
        // FIXED: Use underscore (_) instead of slash (/) for chat_id format to match teacher portal
        const filteredMessages = res.data.filter(
          (msg) => msg.chat_id === `${student._id}_${targetTeacherId}`
        );

        // OPTIMIZATION: Deep comparison logic to prevent massive Component re-renders
        setMessages((prev) => {
          if (prev.length !== filteredMessages.length) return filteredMessages;
          
          const prevLast = prev[prev.length - 1];
          const newLast = filteredMessages[filteredMessages.length - 1];
          
          if (prevLast?._id !== newLast?._id || prevLast?.message !== newLast?.message) {
            return filteredMessages;
          }
          return prev;
        });
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [student?._id]);

  // 4. Polling Setup
  useEffect(() => {
    if (activeTeacherId) {
      fetchMessages(activeTeacherId); // Initial pull

      // Poll specifically for real-time emulation
      const intervalId = setInterval(() => {
        if (activeTeacherRef.current) {
          fetchMessages(activeTeacherRef.current);
        }
      }, 5000);

      return () => clearInterval(intervalId);
    } else {
      setMessages([]);
    }
  }, [activeTeacherId, fetchMessages]);

  const setActiveChat = useCallback((teacherId) => {
    setActiveTeacherId(teacherId);
  }, []);

  // 5. Send Message - FIXED: Match teacher portal format
  const sendMessage = useCallback(async (teacherId, messageText) => {
    if (!messageText.trim() || sendingMessage || !student?._id) return false;

    try {
      setSendingMessage(true);
      // FIXED: Use the same message format as teacher portal
      const messageData = {
        sender_id: student._id,
        sender_role: "student",
        student_id: student._id,
        teacher_id: teacherId,
        message: messageText.trim(),
      };

      await api.post("/messages/send", messageData);
      await fetchMessages(teacherId);
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    } finally {
      setSendingMessage(false);
    }
  }, [sendingMessage, student?._id, fetchMessages]);

  return (
    <ChatContext.Provider
      value={{
        teachersWithDetails,
        fetchingTeachers,
        messages,
        loadingMessages, // Add loading state to context
        sendingMessage,
        activeTeacherId,
        setActiveChat,
        sendMessage,
        refetchTeachers: fetchAllTeacherDetails,
        getOrFetchTeacherDetails,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};