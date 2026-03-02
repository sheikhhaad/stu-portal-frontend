import React from "react";
import { Clock, CheckCircle, MessageSquare, TrendingUp } from "lucide-react";

export default function StatsCard({ queries = [] }) {
  const queryList = Array.isArray(queries) ? queries : [];

  const pending  = queryList.filter((q) => q.status?.toLowerCase() === "pending").length;
  const resolved = queryList.filter((q) => q.status?.toLowerCase() === "resolved").length;
  const total    = queryList.length;
  const rate     = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const stats = [
    {
      label:      "Total Queries",
      value:      total,
      icon:       MessageSquare,
      iconBg:     "bg-indigo-50",
      iconColor:  "text-indigo-600",
      valuColor:  "text-indigo-700",
      border:     "border-indigo-100",
      bar:        "bg-indigo-400",
      barWidth:   "100%",
    },
    {
      label:      "Pending",
      value:      pending,
      icon:       Clock,
      iconBg:     "bg-amber-50",
      iconColor:  "text-amber-600",
      valuColor:  "text-amber-700",
      border:     "border-amber-100",
      bar:        "bg-amber-400",
      barWidth:   total > 0 ? `${Math.round((pending / total) * 100)}%` : "0%",
    },
    {
      label:      "Resolved",
      value:      resolved,
      icon:       CheckCircle,
      iconBg:     "bg-emerald-50",
      iconColor:  "text-emerald-600",
      valuColor:  "text-emerald-700",
      border:     "border-emerald-100",
      bar:        "bg-emerald-400",
      barWidth:   `${rate}%`,
    },
    {
      label:      "Resolution Rate",
      value:      `${rate}%`,
      icon:       TrendingUp,
      iconBg:     "bg-blue-50",
      iconColor:  "text-blue-600",
      valuColor:  "text-blue-700",
      border:     "border-blue-100",
      bar:        "bg-blue-400",
      barWidth:   `${rate}%`,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`
                group bg-white rounded-2xl border ${stat.border} p-5
                shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5
                overflow-hidden relative
              `}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-9 h-9 ${stat.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
                {/* Subtle large bg icon */}
                <Icon className={`h-16 w-16 ${stat.iconColor} opacity-[0.04] absolute -bottom-2 -right-2 pointer-events-none`} />
              </div>

              {/* Value */}
              <p className={`text-3xl font-extrabold ${stat.valuColor} leading-none mb-1`}>
                {stat.value}
              </p>

              {/* Label */}
              <p className="text-xs text-slate-400 font-semibold mb-3">{stat.label}</p>

              {/* Progress bar */}
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stat.bar} rounded-full transition-all duration-700`}
                  style={{ width: stat.barWidth }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}