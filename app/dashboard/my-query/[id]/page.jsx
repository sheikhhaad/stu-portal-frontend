"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueries } from "@/app/context/QueryContext";
import {
  Send,
  Paperclip,
  ChevronLeft,
  Calendar,
  FileText,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import { useStudent } from "@/app/context/StudentContext";
import api from "@/app/lib/api";

const QueryDetail = () => {
  const { id } = useParams();
  const router = useRouter();
  const { queries, loading } = useQueries();
  const { student } = useStudent();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [fetchingMessages, setFetchingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const query = queries?.find((q) => q._id === id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!query?._id) return;
    setFetchingMessages(true);
    try {
      const res = await api.get(`messages/${query._id}`, {
        withCredentials: true,
      });
      if (res.data?.length > 0) {
        setMessages(
          res.data.map((msg) => ({
            id: msg._id,
            sender:
              msg.sender_role === "student"
                ? student?.name || "You"
                : "Instructor",
            senderRole: msg.sender_role,
            content: msg.message,
            timestamp: new Date(msg.createdAt).toLocaleString(),
            avatar:
              msg.sender_role === "student"
                ? student?.name
                  ? student.name.charAt(0).toUpperCase()
                  : "S"
                : "I",
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setFetchingMessages(false);
    }
  };

  useEffect(() => {
    if (query?._id) fetchMessages();
  }, [query?._id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !student?._id || !id) return;
    setSending(true);
    try {
      const res = await api.post(`/messages/send`, {
        query_id: id,
        sender_id: student._id,
        sender_role: "student",
        message: message.trim(),
      });
      setMessages((prev) => [
        ...prev,
        {
          id: res.data._id || Date.now(),
          sender: student?.name || "You",
          senderRole: "student",
          content: message.trim(),
          timestamp: new Date().toLocaleString(),
          avatar: student?.name ? student.name.charAt(0).toUpperCase() : "S",
        },
      ]);
      setMessage("");
    } catch {
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !sending) handleSendMessage(e);
    }
  };

  if (loading && queries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        <p className="mt-3 text-gray-500 text-sm">Loading query details...</p>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="max-w-3xl mx-auto py-10 text-center">
        <h2 className="text-lg font-semibold text-gray-800">Query not found</h2>
        <p className="text-gray-500 text-sm mt-1">
          This query does not exist or has been removed.
        </p>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline mt-4 inline-flex items-center text-sm"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to All Queries
        </button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="max-w-9xl mx-auto py-3">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Queries
      </button>

      {/* Query Info Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold text-gray-800">
                {query.course}
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusColor(query.status)}`}
              >
                {query.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" /> #{query._id.slice(-8)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(query.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg self-start">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">
              Instructor: {query.instructor}
            </span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {typeof query.query === "string" ? query.query : "No query text"}
          </p>
        </div>
      </div>

      {/* Chat Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h3 className="text-sm font-semibold text-gray-800">Discussion</h3>
        </div>

        {/* Messages */}
        <div className="px-4 py-3 space-y-3 max-h-[420px] overflow-y-auto bg-gray-50/50">
          {fetchingMessages ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-600" />
            </div>
          ) : messages.length > 0 ? (
            <>
              {messages.map((msg, index) => {
                const isStudent = msg.senderRole === "student";
                const showAvatar =
                  index === 0 ||
                  messages[index - 1]?.senderRole !== msg.senderRole;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isStudent ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex max-w-[78%] ${isStudent ? "flex-row-reverse" : "flex-row"} gap-2`}
                    >
                      {showAvatar ? (
                        <div
                          className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${isStudent ? "bg-blue-600 text-white" : "bg-gray-700 text-white"}`}
                        >
                          {msg.avatar}
                        </div>
                      ) : (
                        <div className="shrink-0 w-8" />
                      )}
                      <div>
                        {showAvatar && (
                          <div
                            className={`text-[11px] mb-1 ${isStudent ? "text-right" : "text-left"}`}
                          >
                            <span
                              className={
                                isStudent
                                  ? "text-blue-600 font-medium"
                                  : "text-gray-600 font-medium"
                              }
                            >
                              {msg.sender}
                            </span>
                            <span className="text-gray-400 mx-1">·</span>
                            <span className="text-gray-400">
                              {msg.timestamp}
                            </span>
                          </div>
                        )}
                        <div
                          className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${
                            isStudent
                              ? "bg-blue-600 text-white rounded-tr-sm"
                              : "bg-white text-gray-800 rounded-tl-sm border border-gray-200"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-5 w-5 text-indigo-400" />
              </div>
              <p className="text-sm text-gray-500 font-medium">
                No messages yet
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Be the first to start the conversation
              </p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 bg-white">
          <form onSubmit={handleSendMessage}>
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows="1"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none pr-10 transition-all"
                  style={{ minHeight: "40px", maxHeight: "100px" }}
                />
                <button
                  type="button"
                  className="absolute right-2.5 bottom-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!message.trim() || sending}
                className={`p-2.5 rounded-lg bg-blue-600 text-white transition-all ${
                  !message.trim() || sending
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700"
                }`}
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5 text-center">
              Enter to send · Shift+Enter for new line
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QueryDetail;
