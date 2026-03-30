"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChatContext } from "@/app/context/ChatContext";

const StudentChatPage = () => {
  const { id: teacher_id } = useParams();
  const router = useRouter();

  const {
    messages,
    setActiveChat,
    sendMessage,
    sendingMessage,
    getOrFetchTeacherDetails,
    fetchingTeachers,
  } = useChatContext();

  const [newMessage, setNewMessage] = useState("");
  const [teacher, setTeacher] = useState(null);
  const [loadingTeacher, setLoadingTeacher] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 1. Set active chat globally
  useEffect(() => {
    if (teacher_id) {
      setActiveChat(teacher_id);
    }
    return () => setActiveChat(null);
  }, [teacher_id, setActiveChat]);

  // 2. Load the specific teacher cleanly
  // We wait until `fetchingTeachers` is completely done inside Context so
  // we do not fire a duplicate fallback request unless necessary.
  useEffect(() => {
    if (!teacher_id || fetchingTeachers) return;

    let isMounted = true;
    const initializeTeacher = async () => {
      setLoadingTeacher(true);
      const loadedTeacher = await getOrFetchTeacherDetails(teacher_id);

      if (isMounted && loadedTeacher) {
        setTeacher(loadedTeacher.teacherDetails || loadedTeacher);
      }
      if (isMounted) setLoadingTeacher(false);
    };

    initializeTeacher();

    return () => {
      isMounted = false;
    };
  }, [teacher_id, fetchingTeachers, getOrFetchTeacherDetails]);

  // 3. Message sending
  const handleSend = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!newMessage.trim() || sendingMessage) return;

      // UI state holds message input until successful API call
      const success = await sendMessage(teacher_id, newMessage);
      if (success) {
        setNewMessage("");
        // Maintain keyboard focus natively
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [newMessage, sendingMessage, sendMessage, teacher_id],
  );

  // 4. Smooth Smart Scrolling
  // We strictly append dependencies here to trigger only when message array length alters
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!teacher_id || loadingTeacher || fetchingTeachers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
        <div className="text-center bg-white p-8 rounded-3xl shadow-2xl backdrop-blur-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-6 text-indigo-800 font-semibold text-lg">
            Connecting to chat...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-4xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/60">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/dashboard/chat")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-indigo-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-lg font-bold">
                  {teacher?.name?.charAt(0) ||
                    teacher?.teacherName?.charAt(0) ||
                    "T"}
                </span>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {teacher?.name || teacher?.teacherName || "Teacher"}
              </h2>
              <p className="text-xs text-green-500 flex items-center font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors hidden sm:block">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                ></path>
              </svg>
            </button>
            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors hidden sm:block">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                ></path>
              </svg>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors border border-transparent">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 space-y-6">
          <div className="text-center py-4">
            <span className="px-4 py-1.5 bg-gray-100/80 backdrop-blur-sm text-gray-500 rounded-full text-xs font-medium uppercase tracking-wider shadow-sm">
              Today
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <svg
                  className="w-12 h-12 text-indigo-300 transform group-hover:scale-110 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Start the conversation
              </h3>
              <p className="text-gray-500 max-w-sm">
                Send a message to start chatting with{" "}
                {teacher?.name || teacher?.teacherName || "your teacher"}. They
                usually reply within a few hours.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isStudent = msg.sender_role === "student";
              return (
                <div
                  key={msg._id || index}
                  className={`flex ${isStudent ? "justify-end" : "justify-start"} animate-fadeIn`}
                >
                  <div
                    className={`flex max-w-[85%] sm:max-w-[75%] ${isStudent ? "flex-row-reverse" : "flex-row"} items-end gap-2`}
                  >
                    {!isStudent && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center shadow-sm">
                        <span className="text-white text-xs font-bold">
                          {teacher?.name?.charAt(0) ||
                            teacher?.teacherName?.charAt(0) ||
                            "T"}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col">
                      <div
                        className={`px-5 py-3.5 shadow-sm relative group ${
                          isStudent
                            ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-2xl rounded-tr-sm"
                            : "bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100"
                        }`}
                      >
                        <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                      <div
                        className={`flex items-center mt-1.5 space-x-1 ${isStudent ? "justify-end" : "justify-start"}`}
                      >
                        <span
                          className={`text-[11px] font-medium ${isStudent ? "text-indigo-600/70" : "text-gray-400"}`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isStudent && (
                          <svg
                            className="w-3.5 h-3.5 text-indigo-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Input Area */}
        <div className="bg-white px-4 py-4 sm:px-6 sm:py-5 border-t border-gray-100 z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
          <form
            onSubmit={handleSend}
            className="relative flex items-center bg-gray-50/80 rounded-full border border-gray-200/80 p-1.5 shadow-inner transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400"
          >
            <button
              type="button"
              className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-full transition-all shrink-0 ml-1 shadow-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                ></path>
              </svg>
            </button>
            <button
              type="button"
              className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-full transition-all shrink-0 ml-1 shadow-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </button>

            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={sendingMessage}
              className="flex-1 bg-transparent px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none disabled:opacity-50 text-[15px]"
            />

            <button
              type="submit"
              disabled={!newMessage.trim() || sendingMessage}
              className={`p-2.5 ml-2 rounded-full shrink-0 transition-all duration-300 flex items-center justify-center min-w-[44px] ${
                !newMessage.trim() || sendingMessage
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              }`}
            >
              {sendingMessage ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  ></path>
                </svg>
              )}
            </button>
          </form>
          <div className="flex justify-center mt-2 hidden sm:flex">
            <span className="text-[10px] text-gray-400 font-medium tracking-wide flex items-center">
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              End-to-end encrypted chat
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Custom scrollbar for messages */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.5);
        }
      `}</style>
    </div>
  );
};

export default StudentChatPage;
