"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "../lib/api";

const StudentContext = createContext();

export function StudentProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const fetchStudent = async () => {
      // No need to fetch on auth pages
      if (pathname.startsWith("/auth")) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/student/me");
        if (isMounted) {
          setStudent(res.data.student);
          setLoading(false);
        }
      } catch (err) {
        // Redirect to login – component will unmount, no need to set loading false
        router.push("/auth/login");
      }
    };

    fetchStudent();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  const logout = async () => {
    await api.post("/auth/logout");
    setStudent(null);
    router.push("/auth/login");
  };

  return (
    <StudentContext.Provider value={{ student, loading, logout, setStudent }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) throw new Error("useStudent must be used within a StudentProvider");
  return context;
}