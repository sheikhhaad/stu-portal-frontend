// app/dashboard/chat/[id]/page.jsx (Student)
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChatContext } from "@/app/context/ChatContext";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Send,
  Check,
  CheckCheck,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const StudentChatPage = () => {
  const { id: teacher_id } = useParams();
  const router = useRouter();

  const {
    messages,
    setActiveChat,
    sendMessage,
    sendingMessage,
    loadingMessages,
    getOrFetchTeacherDetails,
    fetchingTeachers,
  } = useChatContext();

  const [newMessage, setNewMessage] = useState("");
  const [teacher, setTeacher] = useState(null);
  const [loadingTeacher, setLoadingTeacher] = useState(true);
  const [localSendingMessage, setLocalSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Set active chat
  useEffect(() => {
    if (teacher_id) setActiveChat(teacher_id);
    return () => setActiveChat(null);
  }, [teacher_id, setActiveChat]);

  // Load teacher details
  useEffect(() => {
    if (!teacher_id || fetchingTeachers) return;
    let isMounted = true;
    const loadTeacher = async () => {
      setLoadingTeacher(true);
      const loadedTeacher = await getOrFetchTeacherDetails(teacher_id);
      if (isMounted && loadedTeacher) {
        setTeacher(loadedTeacher.teacherDetails || loadedTeacher);
      }
      if (isMounted) setLoadingTeacher(false);
    };
    loadTeacher();
    return () => {
      isMounted = false;
    };
  }, [teacher_id, fetchingTeachers, getOrFetchTeacherDetails]);

  const handleSend = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!newMessage.trim() || localSendingMessage || sendingMessage) return;
      const text = newMessage;
      setLocalSendingMessage(true);
      setNewMessage("");
      inputRef.current?.focus();
      try {
        await sendMessage(teacher_id, text);
      } catch (error) {
        console.error("Failed to send message:", error);
        setNewMessage(text);
      } finally {
        setLocalSendingMessage(false);
      }
    },
    [newMessage, localSendingMessage, sendingMessage, sendMessage, teacher_id],
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Deduplicate messages
  const uniqueMessages = useCallback(() => {
    const map = new Map();
    messages.forEach((msg) => {
      const key = `${msg.message}_${msg.createdAt}_${msg.sender_role}`;
      if (!map.has(key) || (!msg._isOptimistic && map.get(key)._isOptimistic)) {
        map.set(key, msg);
      }
    });
    return Array.from(map.values());
  }, [messages])();

  if (!teacher_id || loadingTeacher || fetchingTeachers) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
            Initialising Chat...
          </p>
        </div>
      </div>
    );
  }

  const teacherName = teacher?.name || teacher?.teacherName || "Teacher";
  const teacherInitial = teacherName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 flex flex-col max-w-6xl mx-auto">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/chat")}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="relative">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-xl font-bold">
              {teacherInitial}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{teacherName}</h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Active Now
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
            <Phone className="h-4.5 w-4.5" />
          </button>
          <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
            <Video className="h-4.5 w-4.5" />
          </button>
          <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
            <MoreVertical className="h-4.5 w-4.5" />
          </button>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden relative">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          <AnimatePresence initial={false}>
            {uniqueMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10">
                <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6">
                  <MessageSquare className="w-8 h-8 text-slate-200" />
                </div>
                <h3 className="text-slate-800 font-bold text-lg mb-2">
                  Start a conversation
                </h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                  Connect with {teacherName} and discuss your course queries
                  directly.
                </p>
              </div>
            ) : (
              uniqueMessages.map((msg, idx) => {
                const isStudent = msg.sender_role === "student";
                const isOptimistic = msg._isOptimistic === true;
                const time = new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <motion.div
                    key={msg._id || idx}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${isStudent ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex max-w-[85%] sm:max-w-[70%] items-end gap-3 ${isStudent ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {!isStudent && (
                        <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
                          <span className="text-slate-500 text-xs font-bold">
                            {teacherInitial}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <div
                          className={`px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                            isStudent
                              ? "bg-slate-800 text-white rounded-br-none"
                              : "bg-white border border-slate-100 text-slate-700 rounded-bl-none"
                          }`}
                        >
                          {msg.message}
                        </div>
                        <div
                          className={`flex items-center gap-1.5 px-1 ${isStudent ? "justify-end" : "justify-start"}`}
                        >
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {time}
                          </span>
                          {isStudent &&
                            (isOptimistic ? (
                              <RefreshCw className="w-2.5 h-2.5 text-slate-300 animate-spin" />
                            ) : (
                              <CheckCheck className="w-3 h-3 text-blue-500" />
                            ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-50">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm focus-within:border-blue-200 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all"
          >
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${teacherName}...`}
              disabled={localSendingMessage || sendingMessage}
              className="flex-1 bg-transparent px-4 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={
                !newMessage.trim() || localSendingMessage || sendingMessage
              }
              className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-100 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-lg shadow-slate-100"
            >
              {localSendingMessage || sendingMessage ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <div className="w-1 h-1 bg-emerald-500 rounded-full" />
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Secure encrypted channel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentChatPage;
