import React from "react";
import { Clock, CheckCircle, MessageSquare, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function StatsCard({ queries = [] }) {
  const queryList = Array.isArray(queries) ? queries : [];

  const pending = queryList.filter(
    (q) => q.status?.toLowerCase() === "pending",
  ).length;
  const resolved = queryList.filter(
    (q) => q.status?.toLowerCase() === "resolved",
  ).length;
  const total = queryList.length;
  const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const stats = [
    {
      label: "Total Queries",
      value: total,
      icon: MessageSquare,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      valueColor: "text-blue-900",
      border: "border-blue-100",
      bar: "bg-blue-600",
      barWidth: "100%",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      iconBg: "bg-sky-50",
      iconColor: "text-sky-500",
      valueColor: "text-blue-900",
      border: "border-sky-100",
      bar: "bg-sky-400",
      barWidth: total > 0 ? `${Math.round((pending / total) * 100)}%` : "0%",
    },
    {
      label: "Resolved",
      value: resolved,
      icon: CheckCircle,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      valueColor: "text-blue-900",
      border: "border-blue-100",
      bar: "bg-blue-600",
      barWidth: `${rate}%`,
    },
    {
      label: "Resolution Rate",
      value: `${rate}%`,
      icon: TrendingUp,
      iconBg: "bg-sky-50",
      iconColor: "text-sky-500",
      valueColor: "text-blue-900",
      border: "border-sky-100",
      bar: "bg-sky-400",
      barWidth: `${rate}%`,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                group bg-white rounded-2xl border ${stat.border} p-5
                shadow-sm hover:shadow-2xl hover:shadow-blue-50 transition-all duration-300 hover:-translate-y-1
                overflow-hidden relative
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-9 h-9 ${stat.iconBg} rounded-xl flex items-center justify-center shrink-0 border border-white transition-colors group-hover:bg-blue-600`}
                >
                  <Icon className={`h-4 w-4 ${stat.iconColor} group-hover:text-white transition-colors`} />
                </div>
                <Icon
                  className={`h-16 w-16 ${stat.iconColor} opacity-[0.05] absolute -bottom-2 -right-2 pointer-events-none group-hover:scale-110 transition-transform`}
                />
              </div>

              <p
                className={`text-2xl font-black ${stat.valueColor} leading-none mb-1 tabular-nums`}
              >
                {stat.value}
              </p>

              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-4">
                {stat.label}
              </p>

              <div className="w-full h-1 bg-sky-50 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stat.bar} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: stat.barWidth }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
