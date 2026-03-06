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
  User,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import { useStudent } from "@/app/context/StudentContext";
import axios from "axios";

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

  // Find query from context
  const query = queries?.find((q) => q._id === id);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages for this query
  const fetchMessages = async () => {
    if (!query?._id) return;

    setFetchingMessages(true);
    try {
      const res = await axios.get(
        `https://stu-portal-backend.vercel.app/api/messages/${query._id}`,
        { withCredentials: true },
      );

      if (res.data && res.data.length > 0) {
        // Transform messages to match your format
        const formattedMessages = res.data.map((msg) => ({
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
        }));

        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setFetchingMessages(false);
    }
  };

  // Fetch messages when component mounts
  useEffect(() => {
    if (query?._id) {
      fetchMessages();
    }
  }, [query?._id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() || !student?._id || !id) return;

    setSending(true);
    try {
      const res = await axios.post(
        `https://stu-portal-backend.vercel.app/api/messages/send`,
        {
          query_id: id,
          sender_id: student._id,
          sender_role: "student",
          message: message.trim(),
        },
      );

      // Add the new message to the list
      const newMessage = {
        id: res.data._id || Date.now(),
        sender: student?.name || "You",
        senderRole: "student",
        content: message.trim(),
        timestamp: new Date().toLocaleString(),
        avatar: student?.name ? student.name.charAt(0).toUpperCase() : "S",
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !sending) {
        handleSendMessage(e);
      }
    }
  };

  if (loading && queries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-500 font-medium">
          Loading query details...
        </p>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-xl font-bold text-gray-800">Query not found</h2>
        <p className="text-gray-500 mt-2">
          The query you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => router.back()}
          className="text-indigo-600 hover:underline mt-6 inline-flex items-center font-medium"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to All Queries
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
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Back Navigation */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back to Queries
      </button>

      {/* Query Info Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-800">
                {query.course}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(query.status)}`}
              >
                {query.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Query ID: {query._id.slice(-8)}
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(query.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg">
            <GraduationCap className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">
              Instructor: {query.instructor}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-gray-700 whitespace-pre-wrap">
            {typeof query.query === "string" ? query.query : "No query text"}
          </p>
        </div>
      </div>

      {/* Chat Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Discussion
          </h3>
        </div>

        {/* Messages Container */}
        <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto bg-gray-50/50">
          {fetchingMessages ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-indigo-200 border-t-indigo-600"></div>
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
                      className={`flex max-w-[80%] md:max-w-[70%] ${isStudent ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar - Only show for first message in a sequence from same sender */}
                      {showAvatar ? (
                        <div
                          className={`flex-shrink-0 ${isStudent ? "ml-3" : "mr-3"}`}
                        >
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold shadow-md ${
                              isStudent
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-700 text-white"
                            }`}
                          >
                            {msg.avatar}
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`flex-shrink-0 ${isStudent ? "ml-3" : "mr-3"} w-10`}
                        />
                      )}

                      {/* Message Content */}
                      <div>
                        {/* Sender Name - Only show for first message in a sequence */}
                        {showAvatar && (
                          <div
                            className={`text-xs font-medium mb-1 ${isStudent ? "text-right" : "text-left"}`}
                          >
                            <span
                              className={
                                isStudent ? "text-indigo-600" : "text-gray-700"
                              }
                            >
                              {msg.sender}
                            </span>
                            <span className="text-gray-400 mx-2">•</span>
                            <span className="text-gray-400">
                              {msg.timestamp}
                            </span>
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div
                          className={`rounded-2xl p-4 shadow-sm ${
                            isStudent
                              ? "bg-indigo-600 text-white rounded-tr-none"
                              : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-indigo-400" />
              </div>
              <p className="text-gray-500 font-medium">No messages yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Be the first to start the conversation
              </p>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-gray-100 bg-white">
          <form onSubmit={handleSendMessage}>
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none pr-12 transition-all"
                  style={{ minHeight: "52px", maxHeight: "120px" }}
                />
                <button
                  type="button"
                  className="absolute right-3 bottom-3 text-gray-400 hover:text-indigo-600 transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!message.trim() || sending}
                className={`p-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md ${
                  !message.trim() || sending
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-lg transform hover:-translate-y-0.5"
                }`}
                title="Send message"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Press Enter to send • Shift + Enter for new line
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QueryDetail;
