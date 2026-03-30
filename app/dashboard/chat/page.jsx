"use client";
import React, { useEffect } from "react";
import { useEnrollMent } from "@/app/context/TeacherEnroll";
import { useChatContext } from "@/app/context/ChatContext";
import { useRouter } from "next/navigation";

const TeacherListPage = () => {
  const { loading: enrollLoading } = useEnrollMent();
  const { teachersWithDetails, fetchingTeachers } = useChatContext();
  const router = useRouter();

  const openChat = (teacherId, teacherDetails) => {
    console.log("Opening chat with teacher:", teacherDetails);
    router.push(`/dashboard/chat/${teacherId}`);
  };

  if (enrollLoading || fetchingTeachers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-6 text-indigo-800 font-medium text-lg">
            Loading your teachers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Messages
            </h2>
            <p className="text-gray-500 mt-2 text-lg">
              Connect with your enrolled teachers
            </p>
          </div>
        </div>

        {!teachersWithDetails || teachersWithDetails.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-white/40">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg
                className="w-12 h-12 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
            </div>
            <h3 className="text-gray-800 text-2xl font-bold mb-2">
              No teachers found
            </h3>
            <p className="text-gray-500 text-lg">
              You are not enrolled in any courses yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachersWithDetails.map((teacher, index) => {
              const teacherInfo = teacher.teacherDetails || teacher;
              const teacherName = teacherInfo.name || teacher.name || "Teacher";
              const teacherEmail =
                teacherInfo.email || teacher.email || "No email";
              const teacherCourse =
                teacherInfo.course_id || teacher.course_id || "N/A";
              const teacherAvatar = teacherName.charAt(0).toUpperCase();

              return (
                <div
                  key={teacher.teacherId || teacher._id || index}
                  onClick={() => openChat(teacher.teacherId, teacherInfo)}
                  className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-gray-100 group overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-5">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                          <span className="text-white text-2xl font-bold">
                            {teacherAvatar}
                          </span>
                        </div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                          {teacherName}
                        </h3>
                        <p className="text-sm text-gray-500 truncate mb-1">
                          {teacherEmail}
                        </p>
                        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full mt-1">
                          Course ID: {teacherCourse.slice(-6)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end items-center group-hover:bg-indigo-50 transition-colors">
                    <span className="text-sm font-medium text-indigo-600 flex items-center">
                      Chat now
                      <svg
                        className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherListPage;
