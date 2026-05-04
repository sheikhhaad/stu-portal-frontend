"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useStudent } from "./StudentContext";
import api from "../lib/api";

const EnrollMentContext = createContext();

export function EnrollMentProvider({ children }) {
  const [enrollMent, setEnrollMent] = useState([]);
  const [course, setCourse] = useState([]);
  const [loading, setLoading] = useState(false);
  const { student } = useStudent();

  useEffect(() => {
    if (!student?._id) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);

        // 1. Fetch normal student courses
        const res = await api.get(`/enrollments/student/${student._id}`);
        const normalCourses = res.data.courses || [];

        let shazaibCourses = [];
        let shazaibEnrollments = [];

        // 2. Fetch Shazaib specific courses if applicable
        if (student.shazaib_student) {
          try {
            const teacherRes = await api.get("/auth/teacher/shazaibparacha");
            const teacherId = teacherRes.data.teacher._id;

            const enrollRes = await api.get(
              `/enrollments/teacher/all/${teacherId}`,
            );
            shazaibEnrollments = enrollRes.data.teacherEnrollments || [];

            if (shazaibEnrollments.length > 0) {
              const requests = shazaibEnrollments.map((e) =>
                api.get(`/courses/${e.course_id}`),
              );
              const results = await Promise.all(requests);
              shazaibCourses = results
                .map((r) => r.data.course)
                .filter(Boolean);
            }
          } catch (err) {
            console.error("Failed to load Shazaib courses:", err);
          }
        }

        // 3. Merge and deduplicate courses
        const allCourses = [...normalCourses, ...shazaibCourses];
        const uniqueCourses = Array.from(
          new Map(allCourses.map((c) => [c._id, c])).values(),
        );
        setCourse(uniqueCourses);

        // 4. Fetch teacher enrollments for all unique courses
        const teacherPromises = uniqueCourses
          .filter((c) => c?._id)
          .map((c) => api.get(`/enrollments/teacher/${c._id}`));

        const teacherResults = await Promise.all(teacherPromises);
        const allTeachers = [];

        teacherResults.forEach((res) => {
          if (res.data && res.data.teacherEnrollments) {
            if (Array.isArray(res.data.teacherEnrollments)) {
              allTeachers.push(...res.data.teacherEnrollments);
            } else if (res.data.teacherEnrollments?.teachers) {
              allTeachers.push(...res.data.teacherEnrollments.teachers);
            }
          }
        });

        // Add shazaib enrollments if not already present
        shazaibEnrollments.forEach((se) => {
          if (!allTeachers.some((at) => at._id === se._id)) {
            allTeachers.push(se);
          }
        });

        setEnrollMent(allTeachers);
      } catch (err) {
        console.error("Fetch enrollment failed:", err);
        setEnrollMent([]);
        setCourse([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [student]);

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
