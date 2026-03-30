"use client";
import { Menu, Bell, LogOut } from "lucide-react";
import { useStudent } from "@/app/context/StudentContext";

export default function DashboardHeader({ onMenuClick }) {
  const { student, logout } = useStudent();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = student?.name?.split(" ")[0] || "Student";

  return (
    <header className="shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-all border border-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">
            {getGreeting()}
          </p>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">
            {firstName}{" "}
            <span className="inline-block animate-bounce-slow">👋</span>
          </h1>
        </div>
      </div>

      <div className="cursor-pointer hover:text-red-500" onClick={logout}>
        <LogOut />
      </div>
    </header>
  );
}
