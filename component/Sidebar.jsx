"use client";
import {
  GraduationCap,
  LayoutDashboard,
  Bell,
  LogOut,
  X,
  ClipboardList,
  MessageSquare,
} from "lucide-react";
import { useStudent } from "@/app/context/StudentContext";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ClipboardList, label: "Notices", href: "/dashboard/notices" },
  { icon: MessageSquare, label: "Chat", href: "/dashboard/chat" },
];

export default function Sidebar({ isOpen, setIsOpen, mobile = false }) {
  const { student, logout } = useStudent();
  const pathname = usePathname();
  const router = useRouter();

  const initials = student?.name
    ? student.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ST";

  const handleNavigate = (href) => {
    router.push(href);
    if (mobile) setIsOpen(false);
  };

  const SidebarContent = () => (
    <div
      className={`flex flex-col h-full bg-white border-r border-gray-100 ${mobile ? "w-full" : "w-64"}`}
    >
      {/* Brand */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">
            Student Portal
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const active = pathname === href;
          return (
            <button
              key={label}
              onClick={() => handleNavigate(href)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-100"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon
                className={`w-4.5 h-4.5 transition-transform duration-200 ${active ? "" : "group-hover:scale-110"}`}
              />
              {label}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer group">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-semibold shrink-0 shadow-sm shadow-blue-100">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {student?.name || "Student"}
            </p>
            <p className="text-[10px] text-gray-400 font-medium truncate uppercase tracking-wider">
              {student?.rollNumber || ""}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              logout();
            }}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors group/logout"
          >
            <LogOut className="w-4 h-4 text-gray-300 group-hover:text-red-500 group/logout-hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );

  if (mobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 lg:hidden shadow-2xl"
            >
              <SidebarContent />
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all border border-gray-100 lg:hidden"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0">
      <SidebarContent />
    </aside>
  );
}
