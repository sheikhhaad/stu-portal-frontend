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
        setLoading(true);
        setError(null);
        const storedStudent = localStorage.getItem("rollNumber");

        if (storedStudent) {
          try {
            const stuid = JSON.parse(storedStudent);
            const res = await api.get(`/auth/student/${stuid}`);
            setStudent(res.data.student);
          } catch (e) {
            console.error("Error parsing stored student or fetching:", e);
            // If fetching fails, maybe the ID is invalid
            localStorage.removeItem("rollNumber");
          }
        } else if (!pathname.startsWith("/auth")) {
          // If no student and not on auth page, redirect to login
          router.push("/auth/login");
        }
      } catch (err) {
        console.error("Failed to fetch student:", err);
        setError("Failed to load student profile");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [pathname, router]);



  let logout = () => {
    localStorage.removeItem("rollNumber");
    localStorage.removeItem("studentId");
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
