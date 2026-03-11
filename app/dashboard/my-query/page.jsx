"use client";

import { useQueries } from "@/app/context/QueryContext";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  Clock,
  MessageSquare,
  CheckCircle,
  Plus,
  Filter,
  Inbox,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStudent } from "@/app/context/StudentContext";
import Loading from "@/component/Loading";
import Error from "@/component/Error";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    bar: "bg-amber-400",
  },
  "in progress": {
    label: "In Progress",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    bar: "bg-blue-400",
  },
  resolved: {
    label: "Resolved",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    bar: "bg-emerald-400",
  },
  rejected: {
    label: "Rejected",
    badge: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
    bar: "bg-red-400",
  },
  default: {
    label: "Pending",
    badge: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
    bar: "bg-slate-300",
  },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[(status || "").toLowerCase()] || STATUS_CONFIG.default;

export default function MyQueries() {
  const { queries, loading, error, fetchAllQueries } = useQueries();
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { student } = useStudent();

  const allQueries = queries || [];

  const filteredQueries = allQueries.filter((query) => {
    const studentQuery = query.student_id === student?._id;
    const qStatus = query.status || "Pending";

    const matchFilter =
      filter === "All" || qStatus.toLowerCase() === filter.toLowerCase();
    const courseTitle = String(query.course || "");
    const queryTxt = typeof query.query === "string" ? query.query : "";
    const matchSearch =
      courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      queryTxt.toLowerCase().includes(searchTerm.toLowerCase());
    return studentQuery && matchFilter && matchSearch;
  });

  const counts = {
    All: filteredQueries.length,
    Pending: filteredQueries.filter(
      (q) => (q.status || "pending").toLowerCase() === "pending",
    ).length,
    "In Progress": filteredQueries.filter(
      (q) => (q.status || "").toLowerCase() === "in progress",
    ).length,
    Resolved: filteredQueries.filter(
      (q) => (q.status || "").toLowerCase() === "resolved",
    ).length,
  };

  const FILTER_TABS = [
    { key: "All", icon: Filter },
    { key: "Pending", icon: Clock },
    { key: "In Progress", icon: MessageSquare },
    { key: "Resolved", icon: CheckCircle },
  ];

  if (loading && queries.length === 0)
    return <Loading message="Loading your discussion board..." />;
  if (error) return <Error message={error} onRetry={fetchAllQueries} />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                My Queries
              </h1>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-tight text-xs">
              Track and manage all your academic discussions
            </p>
          </div>
          <Link
            href="/dashboard/submit-query"
            className="inline-flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1 active:scale-95 group"
          >
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
            New Query
          </Link>
        </div>

        {/* ── Search + Filters Card ── */}
        <div className="bg-white rounded-4xl border border-slate-100 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search queries or courses..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 placeholder-slate-400 outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 rounded-2xl p-1.5 gap-1 w-full lg:w-auto overflow-x-auto scrollbar-hide">
              {FILTER_TABS.map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`
                    flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all whitespace-nowrap
                    ${
                      filter === key
                        ? "bg-white text-indigo-600 shadow-sm scale-105"
                        : "text-slate-500 hover:text-slate-900"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {key}
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-lg text-[10px] font-black ${
                      filter === key
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {counts[key] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Queries List ── */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredQueries.length > 0 ? (
              filteredQueries.map((query, i) => {
                const status = query.status || "pending";
                const cfg = getStatusConfig(status);
                const resolved = status.toLowerCase() === "resolved";

                return (
                  <motion.div
                    layout
                    key={query._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className={`
                      group relative bg-white rounded-3xl border border-slate-100 overflow-hidden
                      transition-all duration-300
                      ${
                        resolved
                          ? "opacity-80"
                          : "hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/40"
                      }
                    `}
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-2 ${cfg.bar}`}
                    />

                    <div className="p-6 md:p-8">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          {/* Header Metadata */}
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${cfg.badge}`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${cfg.dot} ${status === "pending" ? "animate-pulse" : ""}`}
                              />
                              {cfg.label}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-tight">
                              <Clock className="h-4 w-4" />
                              {new Date(query.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </div>
                            {query.course && (
                              <>
                                <div className="h-1 w-1 bg-slate-300 rounded-full" />
                                <span className="text-xs text-indigo-600 font-black uppercase tracking-widest">
                                  {query.course}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Query Content */}
                          <h3 className="text-xl font-black text-slate-900 leading-tight mb-4 group-hover:text-indigo-600 transition-colors">
                            {typeof query.query === "string"
                              ? query.query
                              : "Academic Inquiry"}
                          </h3>

                          {/* Instructor / Response */}
                          <div className="flex flex-col sm:flex-row gap-4">
                            {query.instructor && (
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl">
                                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                Instructor: {query.instructor}
                              </div>
                            )}
                            {query.response && (
                              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Feedback Received
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center lg:justify-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                          <button
                            onClick={() =>
                              !resolved &&
                              router.push(`/dashboard/my-query/${query._id}`)
                            }
                            disabled={resolved}
                            className={`
                              flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-black transition-all w-full lg:w-auto justify-center
                              ${
                                resolved
                                  ? "bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed"
                                  : "bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95"
                              }
                            `}
                          >
                            {resolved ? (
                              <>
                                <CheckCircle className="h-5 w-5" />
                                Resolved
                              </>
                            ) : (
                              <>
                                View Discussion
                                <ChevronRight className="h-5 w-5" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-4xl border border-slate-100 shadow-sm py-24 px-8 text-center"
              >
                <div className="w-24 h-24 bg-slate-50 rounded-4xl flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-inner">
                  <Inbox className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">
                  {searchTerm ? "No results found" : "Discussion board empty"}
                </h3>
                <p className="text-slate-400 font-bold uppercase tracking-tight text-sm max-w-xs mx-auto mb-10 leading-relaxed">
                  {searchTerm
                    ? `We couldn't find anything matching "${searchTerm}"`
                    : "You haven't submitted any queries yet. Your academic success starts with a question."}
                </p>
                {!searchTerm && (
                  <Link
                    href="/dashboard/submit-query"
                    className="inline-flex items-center gap-3 px-8 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black transition-all shadow-2xl shadow-indigo-200 hover:-translate-y-1"
                  >
                    <Plus className="h-6 w-6" />
                    Submit Your First Query
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
