"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Bell } from "lucide-react";
import { useState } from "react";
import { useStudent } from "@/app/context/StudentContext";
import NotificationBell from "./NotificationBell";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const pathname  = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { student } = useStudent();
  const router = useRouter();

  const navLinks = [
    { href: "/dashboard",              label: "Dashboard" },
    { href: "/dashboard/my-query",     label: "My Queries" },
    { href: "/dashboard/submit-query", label: "Submit Query" },
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-sm shadow-slate-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Left: Logo + Nav ── */}
          <div className="flex items-center gap-8">

            {/* Logo */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group flex-shrink-0"
            >
              <div className="h-9 w-9 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-extrabold text-sm tracking-tight">SP</span>
              </div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight hidden sm:block">
                Student<span className="text-indigo-600">Portal</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                    ${isActive(link.href)
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }
                  `}
                >
                  {link.label}
                  {/* Active indicator dot */}
                  {isActive(link.href) && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Right: Notification + Profile ── */}
          <div className="flex items-center gap-3">

            {/* Notification Bell */}
            <NotificationBell />

            {/* Vertical divider */}
            <div className="w-px h-6 bg-slate-200 hidden sm:block" />

            {/* Profile */}
            <button
              onClick={() => router.push("/dashboard/profile")}
              className="flex items-center gap-3 pl-1 pr-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
            >
              {/* Avatar with gradient ring */}
              <div className="relative flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-sm">
                  <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student?.name || "user"}`}
                      alt="User"
                      className="h-full w-full rounded-full"
                    />
                  </div>
                </div>
                {/* Online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>

              {/* Name + ID */}
              <div className="hidden lg:block text-left">
                <p className="text-sm font-bold text-slate-800 leading-none">
                  {student?.name || "Student"}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  ID: {student?.rollNumber || "—"}
                </p>
              </div>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">

          {/* Nav links */}
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${isActive(link.href)
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }
                `}
              >
                {isActive(link.href) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                )}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Profile row */}
          <div
            className="mx-4 mb-4 mt-1 flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:border-indigo-100 hover:bg-indigo-50/30 transition-all"
            onClick={() => { router.push("/dashboard/profile"); setIsMenuOpen(false); }}
          >
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-sm">
                <div className="h-full w-full rounded-full bg-white overflow-hidden">
                  <img
                    className="h-full w-full rounded-full"
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student?.name || "user"}`}
                    alt=""
                  />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{student?.name}</p>
              <p className="text-xs text-slate-400 font-medium truncate">{student?.email}</p>
            </div>
            <Bell className="h-4 w-4 text-slate-400 flex-shrink-0" />
          </div>
        </div>
      )}
    </nav>
  );
}