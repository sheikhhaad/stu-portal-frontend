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
import socket from "@/app/lib/socket";

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

  // ✅ Ref tracks active chat_id for socket handler without stale closure
  const activeChatIdRef = useRef(null);

  // 1. Fetch enrolled teachers
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

  // 2. Teacher detail lookup with cache
  const getOrFetchTeacherDetails = useCallback(
    async (teacherId) => {
      if (!teacherId) return null;
      const cached = teachersWithDetails.find(
        (t) => t.teacherId === teacherId || t._id === teacherId,
      );
      if (cached) return cached;
      try {
        const res = await api.get(`/enrollments/teacher/info/${teacherId}`);
        return res.data?.teacher || res.data;
      } catch (error) {
        console.error("Error fetching single teacher fallback:", error);
        return null;
      }
    },
    [teachersWithDetails],
  );

  // 3. Fetch messages — populates state, no client-side filter needed
  const fetchMessages = useCallback(
    async (targetTeacherId) => {
      if (!student?._id || !targetTeacherId) return;
      try {
        setLoadingMessages(true);
        const res = await api.get(
          `/messages/${student._id}/${targetTeacherId}`,
        );
        const data = Array.isArray(res.data) ? res.data : [];
        // ✅ Removed redundant client-side filter — backend already
        // returns only messages for this chat_id
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    },
    [student?._id],
  );

  // 4. Set active chat + initial fetch + socket room
  useEffect(() => {
    if (!activeTeacherId || !student?._id) {
      setMessages([]);
      if (activeChatIdRef.current) {
        socket.emit("leave_chat", activeChatIdRef.current);
        activeChatIdRef.current = null;
      }
      return;
    }

    const chatId = `${student._id}_${activeTeacherId}`;
    
    if (activeChatIdRef.current && activeChatIdRef.current !== chatId) {
      socket.emit("leave_chat", activeChatIdRef.current);
    }
    
    activeChatIdRef.current = chatId;
    socket.emit("join_chat", chatId);

    fetchMessages(activeTeacherId);

    return () => {
      socket.emit("leave_chat", chatId);
      activeChatIdRef.current = null;
    };
  }, [activeTeacherId, student?._id, fetchMessages]);

  // 5. Socket listener — single event, uses ref to filter correctly
  useEffect(() => {
    if (!student?._id) return;

    const handleReceiveMessage = (newMessage) => {
      // ✅ Use ref — not state — so this is never a stale closure
      if (
        activeChatIdRef.current &&
        newMessage.chat_id !== activeChatIdRef.current
      ) {
        return;
      }

      setMessages((prev) => {
        // ✅ Deduplicate — covers both real-time and optimistic replacements
        if (prev.find((m) => m._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
    };

    // ✅ Single listener — "receive_message" matches exactly what backend emits
    // Removed dead "message received" listener
    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [student?._id]); // ✅ empty-ish deps — ref keeps handler current

  const setActiveChat = useCallback((teacherId) => {
    setActiveTeacherId(teacherId);
  }, []);

  // 6. Send message with optimistic update
  const sendMessage = useCallback(
    async (teacherId, messageText) => {
      if (!messageText.trim() || sendingMessage || !student?._id) return false;

      // ✅ Optimistic update — message appears instantly
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

        // ✅ Replace optimistic message with real saved one
        setMessages((prev) =>
          prev.map((m) => (m._id === optimisticMsg._id ? savedMsg : m)),
        );

        // ✅ Removed socket.emit("send_message") — backend's sendRealtime()
        // already broadcasts to all clients. Emitting again caused
        // duplicate messages appearing on both sides.

        // ✅ Removed fetchMessages() call — optimistic update + socket
        // handles everything. Re-fetching caused flicker and race conditions.

        return true;
      } catch (error) {
        console.error("Error sending message:", error);
        // ✅ Roll back optimistic message on failure
        setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
        return false;
      } finally {
        setSendingMessage(false);
      }
    },
    [sendingMessage, student?._id],
    // ✅ Removed fetchMessages from deps — it's no longer called here
  );

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
