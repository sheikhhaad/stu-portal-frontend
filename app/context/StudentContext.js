"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "../lib/api";

const StudentContext = createContext();

export function StudentProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (pathname.startsWith("/auth")) {
          setLoading(false);
          return;
        }
        const res = await api.get("/auth/student/me");
        setStudent(res.data.student);
      } catch (err) {
        router.push("/auth/login");
      }
    };

    fetchStudent();
  }, []);
  let logout = () => {
    let res = api.post("/auth/logout");
    setStudent(null);
    router.push("/auth/login");
  };

  return (
    <StudentContext.Provider
      value={{ notifications, student, loading, error, logout, setStudent }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context)
    throw new Error("useStudent must be used within a StudentProvider");
  return context;
}
