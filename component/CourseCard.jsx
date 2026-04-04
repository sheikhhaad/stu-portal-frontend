"use client";

import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CourseCard({ course }) {
  return (
    <Link href={`/dashboard/courses/${course._id}`} className="block group">
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-600 transition-all duration-300 active:scale-[0.98] group-hover:shadow-2xl group-hover:shadow-blue-50">

        {/* Top accent bar */}
        <div className="h-1 w-full bg-blue-600 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

        {/* Body */}
        <div className="p-6">
          {/* Title + code */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-base font-bold text-gray-900 leading-tight line-clamp-2 flex-1 group-hover:text-blue-700 transition-colors">
              {course.name}
            </h2>
            <span className="shrink-0 px-2.5 py-1 bg-sky-50 text-blue-500 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-sky-100 transition-colors group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600">
              {course.code}
            </span>
          </div>

          {/* Description */}
          {course.description && (
            <p className="text-xs text-gray-400 line-clamp-2 font-medium leading-relaxed mb-6">
              {course.description}
            </p>
          )}

          {/* Schedule row */}
          <div className="flex items-center gap-4 pt-4 border-t border-sky-50">
            {course.days && (
              <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-all">
                <Calendar className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="text-[10px] text-blue-900 font-bold uppercase tracking-widest">{course.days}</span>
              </div>
            )}
            {course.time && (
              <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-all">
                <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="text-[10px] text-blue-900 font-bold uppercase tracking-widest">{course.time}</span>
              </div>
            )}
            <div className="ml-auto w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-sky-300 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:-rotate-45">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}