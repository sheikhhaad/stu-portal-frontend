"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const StudentContext = createContext();

export function StudentProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [notifications, setNotifications] = useState([
    // { id: 1, message: 'Your query #2 status changed to In Progress', read: false },
    // { id: 2, message: 'New announcement: Midterm results are out', read: true },
  ]);

  // Fetch student info from localStorage
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const storedStudent = localStorage.getItem("rollNumber");
        if (storedStudent) {
          const stuid = JSON.parse(storedStudent);
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/student/${stuid}`,
          );
          setStudent(res.data.student); // student object with _id
        }
      } catch (error) {
        console.error("Failed to fetch student:", error);
      }
    };
    fetchStudent();
  }, []);

  // const markNotificationRead = (id) => {
  //     setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  // };

  return (
    <StudentContext.Provider value={{ notifications, student }}>
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
