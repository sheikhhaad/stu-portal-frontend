"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useStudent } from "./StudentContext";
import api from "../lib/api";

const EnrollMentContext = createContext();

export function EnrollMentProvider({ children }) {
  const [enrollMent, setEnrollMent] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  let { student } = useStudent();

  useEffect(() => {
    if (!student) return;

    const fetchStuEnrollment = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/enrollments/student/${student?._id}`);
        setCourse(res.data.courses);
      } catch (err) {
        console.error("Fetch enrollment failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStuEnrollment();
  }, [student]);

  useEffect(() => {
    if (!course || course.length === 0) {
      setEnrollMent([]);
      return;
    }

    const fetchTeacherEnrollment = async () => {
      try {
        setLoading(true);

        const promises = course
          .filter((c) => c?._id)
          .map((c) => api.get(`/enrollments/teacher/${c._id}`));

        const results = await Promise.all(promises);

        // Extract ALL teachers from enrollments (keep duplicates)
        const allTeachers = [];

        results.forEach((res) => {
          if (res.data && res.data.teacherEnrollments) {
            if (Array.isArray(res.data.teacherEnrollments)) {
              allTeachers.push(...res.data.teacherEnrollments);
            } else if (res.data.teacherEnrollments?.teachers) {
              allTeachers.push(...res.data.teacherEnrollments.teachers);
            }
          }
        });

        setEnrollMent(allTeachers);
      } catch (err) {
        console.error("Fetch enrollment failed:", err);
        setEnrollMent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherEnrollment();
  }, [course]);

  return (
    <EnrollMentContext.Provider
      value={{
        enrollMent,
        setEnrollMent,
        loading,
        course,
      }}
    >
      {children}
    </EnrollMentContext.Provider>
  );
}

export function useEnrollMent() {
  const context = useContext(EnrollMentContext);
  if (!context) {
    throw new Error("useEnrollMent must be used within EnrollMentProvider");
  }
  return context;
}
