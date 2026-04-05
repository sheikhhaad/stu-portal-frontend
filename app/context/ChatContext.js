// context/ChatContext.jsx (Student)
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api from "@/app/lib/api";
import { useStudent } from "./StudentContext";
import { useEnrollMent } from "./TeacherEnroll";
import { socket } from "@/app/lib/socket"; // ✅ import socket

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { student } = useStudent();
  const { enrollMent } = useEnrollMent();

  const [teachersWithDetails, setTeachersWithDetails] = useState([]);
  const [fetchingTeachers, setFetchingTeachers] = useState(true);
  const [messages, setMessages] = useState([]);
  const [activeTeacherId, setActiveTeacherId] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const activeChatIdRef = useRef(null); // track active chat for filtering

  // 1. Fetch enrolled teachers with details
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

  useEffect(() => {
    fetchAllTeacherDetails();
  }, [fetchAllTeacherDetails]);

  // 2. Fetch messages for the active teacher
  const fetchMessages = useCallback(
    async (targetTeacherId) => {
      if (!student?._id || !targetTeacherId) return;
      try {
        setLoadingMessages(true);
        const res = await api.get(
          `/messages/${student._id}/${targetTeacherId}`,
        );
        const data = Array.isArray(res.data) ? res.data : [];
        setMessages(data);
        // Update active chat ID for socket filtering
        activeChatIdRef.current = `${student._id}_${targetTeacherId}`;
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    },
    [student?._id],
  );

  // 3. Fetch messages when active teacher changes
  useEffect(() => {
    if (!student?._id) return;
    fetchMessages(activeTeacherId);
  }, [activeTeacherId, student?._id, fetchMessages]);

  // 4. Set active chat (teacher)
  const setActiveChat = useCallback((teacherId) => {
    setActiveTeacherId(teacherId);
  }, []);

  // 5. Send message with optimistic update
  const sendMessage = useCallback(
    async (teacherId, messageText) => {
      if (!messageText.trim() || sendingMessage || !student?._id) return false;

      const optimisticMsg = {
        _id: `temp_${Date.now()}`,
        chat_id: `${student._id}_${teacherId}`,
        sender_id: student._id,
        sender_role: "student",
        message: messageText.trim(),
        createdAt: new Date().toISOString(),
        _isOptimistic: true,
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        setSendingMessage(true);
        const res = await api.post("/messages/send", {
          sender_id: student._id,
          sender_role: "student",
          student_id: student._id,
          teacher_id: teacherId,
          message: messageText.trim(),
        });

        const savedMsg = res.data?.data || res.data;
        setMessages((prev) =>
          prev.map((m) => (m._id === optimisticMsg._id ? savedMsg : m)),
        );
        return true;
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
        return false;
      } finally {
        setSendingMessage(false);
      }
    },
    [sendingMessage, student?._id],
  );

  // 6. Real‑time socket listener – global "new_message", filtered by active chat
  useEffect(() => {
    if (!student?._id) return;
    if (!socket.connected) socket.connect();

    const handleNewMessage = (newMessage) => {
      // Only add if it belongs to the currently open chat
      if (newMessage.chat_id === activeChatIdRef.current) {
        setMessages((prev) => {
          if (prev.find((m) => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [student?._id]);

  // 7. Clear active chat on unmount (optional)
  useEffect(() => {
    return () => {
      activeChatIdRef.current = null;
    };
  }, []);

  return (
    <ChatContext.Provider
      value={{
        teachersWithDetails,
        fetchingTeachers,
        messages,
        loadingMessages,
        sendingMessage,
        activeTeacherId,
        setActiveChat,
        sendMessage,
        refetchTeachers: fetchAllTeacherDetails,
        getOrFetchTeacherDetails: async (teacherId) => {
          const cached = teachersWithDetails.find(
            (t) => t.teacherId === teacherId || t._id === teacherId,
          );
          if (cached) return cached;
          try {
            const res = await api.get(`/enrollments/teacher/info/${teacherId}`);
            return res.data?.teacher || res.data;
          } catch (error) {
            console.error("Error fetching single teacher:", error);
            return null;
          }
        },
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
