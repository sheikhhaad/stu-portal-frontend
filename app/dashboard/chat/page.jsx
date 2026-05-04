"use client";
import { useEnrollMent } from "@/app/context/TeacherEnroll";
import { useChatContext } from "@/app/context/ChatContext";
import { useRouter } from "next/navigation";
import { MessageSquare, Users, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const TeacherListPage = () => {
  const { loading: enrollLoading, course: enrolledCourses } = useEnrollMent();
  const { teachersWithDetails, fetchingTeachers } = useChatContext();
  const router = useRouter();

  const openChat = (teacherId) => {
    router.push(`/dashboard/chat/${teacherId}`);
  };

  if (enrollLoading || fetchingTeachers) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-0">
        <div className="bg-white rounded-2xl h-32 animate-pulse border border-slate-100" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-100 rounded-xl h-40 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Teachers",
      value: teachersWithDetails.length,
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Enrolled Courses",
      value: enrolledCourses?.length || 0,
      icon: ShieldCheck,
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto space-y-7 px-4 sm:px-0"
    >
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h1 className="text-xl font-bold text-slate-800">
          Messages
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Connect with your enrolled teachers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 border border-slate-100 flex justify-between"
          >
            <div>
              <p className="text-xs text-slate-400">
                {stat.label}
              </p>
              <p className="text-2xl font-bold">
                {stat.value}
              </p>
            </div>
            <div className={`${stat.color} p-2 rounded-lg`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {!teachersWithDetails?.length ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center border-dashed">
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
            const avatarLetter = teacherName.charAt(0).toUpperCase();

            return (
              <motion.div
                key={teacherId || index}
                onClick={() => openChat(teacherId)}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <span className="text-blue-600 text-xl font-bold group-hover:text-white transition-colors">
                          {avatarLetter}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                        {teacherName}
                      </h3>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{teacherEmail}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50/50 px-6 py-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available now</span>
                  <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    Message
                    <MessageSquare className="h-3.5 w-3.5" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default TeacherListPage;