"use client";

import { useQueries } from "@/app/context/QueryContext";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  Plus,
  Filter,
  Inbox,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const { queries, loading } = useQueries();
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const allQueries = queries || [];

  // Count per status
  const counts = {
    All: allQueries.length,
    Pending: allQueries.filter(
      (q) => (q.status || "pending").toLowerCase() === "pending",
    ).length,
    "In Progress": allQueries.filter(
      (q) => (q.status || "").toLowerCase() === "in progress",
    ).length,
    Resolved: allQueries.filter(
      (q) => (q.status || "").toLowerCase() === "resolved",
    ).length,
  };

  const filteredQueries = allQueries.filter((query) => {
    const qStatus = query.status || "Pending";
    const matchFilter =
      filter === "All" || qStatus.toLowerCase() === filter.toLowerCase();
    const courseTitle = String(query.course || "");
    const queryTxt = typeof query.query === "string" ? query.query : "";
    const matchSearch =
      courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      queryTxt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const FILTER_TABS = [
    { key: "All", icon: Filter },
    { key: "Pending", icon: Clock },
    { key: "In Progress", icon: MessageSquare },
    { key: "Resolved", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Queries
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-0.5">
              Manage and track the status of your requests
            </p>
          </div>
          <Link
            href="/dashboard/submit-query"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            New Query
          </Link>
        </div>

        {/* ── Search + Filters Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by course or query..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1 w-full md:w-auto overflow-x-auto">
              {FILTER_TABS.map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`
                    flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all
                    ${
                      filter === key
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }
                  `}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {key}
                  <span
                    className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
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
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 border-t-indigo-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm font-medium">
                Loading your queries...
              </p>
            </div>
          </div>
        ) : filteredQueries.length > 0 ? (
          <div className="space-y-3">
            {filteredQueries.map((query) => {
              const status = query.status || "pending";
              const cfg = getStatusConfig(status);
              const resolved = status.toLowerCase() === "resolved";

              return (
                <div
                  key={query._id}
                  className={`
                    group relative bg-white rounded-2xl border overflow-hidden
                    transition-all duration-300
                    ${
                      resolved
                        ? "border-slate-100 opacity-80"
                        : "border-slate-200 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/40"
                    }
                  `}
                >
                  {/* Left status bar */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar}`}
                  />

                  <div className="pl-5 pr-5 py-5">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left content */}
                      <div className="flex-1 min-w-0">
                        {/* Status + Date + Instructor */}
                        <div className="flex flex-wrap items-center gap-2.5 mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wide ${cfg.badge}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`}
                            />
                            {cfg.label}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(query.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                          {query.instructor && (
                            <>
                              <span className="w-1 h-1 bg-slate-300 rounded-full" />
                              <span className="text-xs text-slate-400 font-medium">
                                {query.instructor}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Course title */}
                        {query.course && (
                          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1.5">
                            {query.course}
                          </p>
                        )}

                        {/* Query text */}
                        <p className="text-slate-800 font-semibold text-base leading-snug mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {typeof query.query === "string"
                            ? query.query
                            : "No query text"}
                        </p>

                        {/* Response */}
                        {query.response && (
                          <div className="flex items-start gap-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-3">
                            <MessageSquare className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-600 leading-relaxed">
                              <span className="font-bold text-indigo-700">
                                Response:{" "}
                              </span>
                              {query.response}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right: Action button */}
                      <div className="flex items-center flex-shrink-0 self-center md:self-start mt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!resolved)
                              router.push(`/dashboard/my-query/${query._id}`);
                          }}
                          disabled={resolved}
                          className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all
                            ${
                              resolved
                                ? "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed"
                                : "bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-md hover:shadow-indigo-200 active:scale-95"
                            }
                          `}
                        >
                          {resolved ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Resolved
                            </>
                          ) : (
                            <>
                              Discuss
                              <ChevronRight className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col items-center justify-center py-24 px-6">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 border border-slate-100">
                <Inbox className="h-7 w-7 text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                No Queries Found
              </h3>
              <p className="text-slate-400 text-sm text-center max-w-xs leading-relaxed mb-6">
                {searchTerm
                  ? `No results for "${searchTerm}". Try different keywords.`
                  : "You haven't submitted any queries yet. Start by creating one."}
              </p>
              {!searchTerm && (
                <Link
                  href="/dashboard/submit-query"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-200"
                >
                  <Plus className="h-4 w-4" />
                  Submit Your First Query
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
