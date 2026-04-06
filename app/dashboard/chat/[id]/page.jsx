// app/dashboard/chat/[id]/page.jsx (Student)
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChatContext } from "@/app/context/ChatContext";
import { ArrowLeft, Phone, Video, MoreVertical, Send, Check, CheckCheck } from "lucide-react";

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
    return () => { isMounted = false; };
  }, [teacher_id, fetchingTeachers, getOrFetchTeacherDetails]);

  const handleSend = useCallback(async (e) => {
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
  }, [newMessage, localSendingMessage, sendingMessage, sendMessage, teacher_id]);

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
    messages.forEach(msg => {
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
        <div className="text-center bg-white p-6 rounded-xl shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-slate-800 mx-auto" />
          <p className="mt-4 text-slate-500 text-sm">Connecting...</p>
        </div>
      </div>
    );
  }

  const teacherName = teacher?.name || teacher?.teacherName || "Teacher";
  const teacherInitial = teacherName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 py-4 px-4 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-4xl h-[90vh] bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/chat")}
              className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="relative">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <span className="text-slate-700 font-semibold text-sm">{teacherInitial}</span>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">{teacherName}</h2>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Online
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition">
              <Phone className="h-4 w-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition">
              <Video className="h-4 w-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/30 space-y-4">
          {loadingMessages && uniqueMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-600" />
              <p className="mt-3 text-xs text-slate-400">Loading messages...</p>
            </div>
          ) : uniqueMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-700">No messages yet</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1">Send a message to start the conversation.</p>
            </div>
          ) : (
            uniqueMessages.map((msg, idx) => {
              const isStudent = msg.sender_role === "student";
              const isOptimistic = msg._isOptimistic === true;
              const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

              return (
                <div key={msg._id || idx} className={`flex ${isStudent ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[80%] ${isStudent ? "flex-row-reverse" : "flex-row"} items-end gap-2`}>
                    {!isStudent && (
                      <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-slate-600 text-xs font-medium">{teacherInitial}</span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className={`px-4 py-2.5 rounded-2xl ${isStudent ? "bg-slate-800 text-white rounded-tr-sm" : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm"}`}>
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <div className={`flex items-center gap-1 mt-1 text-[10px] ${isStudent ? "justify-end" : "justify-start"}`}>
                        <span className="text-slate-400">{time}</span>
                        {isStudent && (
                          isOptimistic ? (
                            <div className="w-3 h-3 border border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                          ) : (
                            <CheckCheck className="w-3 h-3 text-slate-400" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="bg-white border-t border-slate-100 p-4">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={localSendingMessage || sendingMessage}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 disabled:opacity-50 transition"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || localSendingMessage || sendingMessage}
              className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all shrink-0"
            >
              {localSendingMessage || sendingMessage ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
          <p className="text-[10px] text-slate-300 text-center mt-2 flex items-center justify-center gap-1">
            <span className="inline-block w-1 h-1 bg-slate-300 rounded-full" />
            End-to-end encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentChatPage;