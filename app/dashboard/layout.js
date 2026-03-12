"use client";
import { useState } from "react";
import Sidebar from "@/component/Sidebar";
import DashboardHeader from "@/component/DashboardHeader";
import { StudentProvider } from "../context/StudentContext";
import { QueryProvider } from "../context/QueryContext";
import "../../app/globals.css";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <StudentProvider>
        <QueryProvider>
          {/* Sidebar - Desktop */}
          <Sidebar />

          {/* Sidebar - Mobile */}
          <Sidebar mobile isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

            {/* Scrollable body */}
            <main className="flex-1 overflow-y-auto px-6 py-8">
              {children}
            </main>
          </div>
        </QueryProvider>
      </StudentProvider>
    </div>
  );
}
