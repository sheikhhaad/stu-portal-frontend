// components/CourseCard.jsx
import Link from "next/link";
import { Calendar, Clock, User } from "lucide-react";

export default function CourseCard({ course }) {
  return (
    <Link href={`/dashboard/courses/${course._id}`} className="block">
      <div
        className="
        w-full  
        bg-white 
        rounded-xl 
        shadow-lg 
        overflow-hidden 
        border border-gray-200
        transition-all duration-300
        hover:shadow-xl hover:scale-[1.02]
        cursor-pointer
      "
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {course.title}
            </h2>
            <span
              className="
              px-4 py-1.5 
              bg-white/20 backdrop-blur-sm 
              text-white text-sm font-semibold 
              rounded-full border border-white/30
            "
            >
              {course.code}
            </span>
          </div>
        </div>

        {/* Main content area */}
        <div className="p-6 pt-5">
          {/* Quick info grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-500" />
              <div>
                <p className="text-xs text-gray-500">Days</p>
                <p className="text-sm font-medium text-gray-800">
                  {course.days}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-500" />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-medium text-gray-800">
                  {course.time}
                </p>
              </div>
            </div>
          </div>

          {/* Description preview */}
          <p className="text-sm text-gray-600 mb-6 line-clamp-2">
            {course.description}
          </p>

          {/* View Details button (styled but Link handles navigation) */}
          <div
            className="
            w-full 
            py-2
            bg-gradient-to-r from-indigo-600 to-blue-600 
            hover:from-indigo-700 hover:to-blue-700 
            text-white font-medium 
            rounded-xl 
            transition-all duration-300 
            flex items-center justify-center gap-2
            shadow-md hover:shadow-lg
          "
          >
            <span className="text-lg">📘</span>
            View Course
          </div>
        </div>
      </div>
    </Link>
  );
}
