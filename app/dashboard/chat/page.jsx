"use client";
import { useEnrollMent } from "@/app/context/TeacherEnroll";
import { useChatContext } from "@/app/context/ChatContext";
import { useRouter } from "next/navigation";
import { MessageSquare, Users } from "lucide-react";

const TeacherListPage = () => {
  const { loading: enrollLoading } = useEnrollMent();
  const { teachersWithDetails, fetchingTeachers } = useChatContext();
  const router = useRouter();

  const openChat = (teacherId) => {
    router.push(`/dashboard/chat/${teacherId}`);
  };

  if (enrollLoading || fetchingTeachers) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-slate-800 mx-auto" />
          <p className="mt-5 text-slate-600 font-medium">Loading your teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Messages</h2>
          <p className="text-slate-500 mt-1">Connect with your enrolled teachers</p>
        </div>

        {!teachersWithDetails?.length ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-slate-300" />
            </div>
            <h3 className="text-slate-800 text-lg font-semibold mb-1">No teachers found</h3>
            <p className="text-slate-400 text-sm">You are not enrolled in any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teachersWithDetails.map((teacher, index) => {
              const teacherInfo = teacher.teacherDetails || teacher;
              const teacherId = teacher.teacherId || teacher._id;
              const teacherName = teacherInfo.name || "Teacher";
              const teacherEmail = teacherInfo.email || "No email";
              const courseId = teacherInfo.course_id || teacher.course_id || "N/A";
              const avatarLetter = teacherName.charAt(0).toUpperCase();

              return (
                <div
                  key={teacherId || index}
                  onClick={() => openChat(teacherId)}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                          <span className="text-slate-700 text-xl font-semibold">
                            {avatarLetter}
                          </span>
                        </div>
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-slate-800 truncate group-hover:text-slate-900">
                          {teacherName}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">{teacherEmail}</p>
                        <span className="inline-block mt-1.5 text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          Course: {courseId.slice(-6)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-100 flex justify-end">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1 group-hover:text-slate-700 transition-colors">
                      Chat now
                      <MessageSquare className="h-3 w-3" />
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