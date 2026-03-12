"use client";

import { useQueries } from "@/app/context/QueryContext";
import { useStudent } from "@/app/context/StudentContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Search,
  ChevronRight,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Filter,
  Inbox,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "@/component/Loading";
import Error from "@/component/Error";

const STATUS_MAP = {
  resolved: {
    label: "Resolved",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-100",
    dot: "bg-emerald-500",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-700",
    bg: "bg-red-50 border-red-100",
    dot: "bg-red-500",
    icon: XCircle,
  },
  pending: {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-100",
    dot: "bg-amber-400",
    icon: Clock,
  },
};

const getStatus = (status) =>
  STATUS_MAP[status?.toLowerCase()] || STATUS_MAP.pending;

export default function MyQueriesPage() {
  const { queries, loading, error, fetchAllQueries } = useQueries();
  const { student } = useStudent();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredQueries = (queries || []).filter((q) => {
    const matchesSearch =
      q.query?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.course_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" || q.status?.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading && queries.length === 0)
    return <Loading message="Syncing your discussions..." />;
  if (error) return <Error message={error} onRetry={fetchAllQueries} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-100">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Academic Queries
            </h1>
          </div>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            Personal Discussion Board
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-fit">
          {["all", "pending", "resolved"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f
                  ? "bg-blue-600 text-white shadow-sm border border-blue-500"
                  : "text-gray-400 hover:text-blue-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
        <input
          type="text"
          placeholder="Filter by question content or course ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-100 rounded-3xl py-5 pl-14 pr-6 text-sm font-bold text-gray-900 placeholder-gray-300 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all shadow-sm"
        />
      </div>

      {/* Query List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredQueries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 py-32 text-center"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-100">
                <Inbox className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No conversations found
              </h3>
              <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8">
                {searchTerm
                  ? "Try adjusting your search terms or filters."
                  : "Your academic discussions will appear here."}
              </p>
            </motion.div>
          ) : (
            filteredQueries.map((query, i) => {
              const status = getStatus(query.status);
              const Icon = status.icon;

              return (
                <motion.div
                  key={query._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() =>
                    router.push(`/dashboard/my-query/${query._id}`)
                  }
                  className="bg-white border border-gray-100 rounded-4xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-50 transition-all group relative overflow-hidden"
                >
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${status.bg} ${status.color}`}
                      >
                        <Icon className="w-3 h-3" />
                        {status.label}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                        <Calendar className="w-3 h-3" />
                        {new Date(query.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-gray-900 leading-tight group-hover:text-gray-700 transition-colors">
                      {query.query}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden md:block w-px h-12 bg-sky-50" />
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
