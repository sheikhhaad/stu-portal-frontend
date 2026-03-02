"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useStudent } from "./StudentContext";

const QueryContext = createContext();

export function QueryProvider({ children }) {
  const { student } = useStudent();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all queries of logged student
  const fetchAllQueries = useCallback(async () => {
    if (!student?._id) return;

    try {
      setLoading(true);

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/queries/all`, {
        withCredentials: true,
      });

      const fetchedQueries = Array.isArray(res.data)
        ? res.data
        : res.data.queries || [];
      setQueries(fetchedQueries);
    } catch (error) {
      console.error("Fetch all queries failed:", error);
      setQueries([]);
    } finally {
      setLoading(false);
    }
  }, [student?._id]);

  // Fetch course specific queries
  const fetchCourseQueries = useCallback(
    async (courseId) => {
      if (!student?._id || !courseId) return [];

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/queries/${student._id}/course/${courseId}`,
          { withCredentials: true },
        );

        return Array.isArray(res.data) ? res.data : res.data.queries || [];
      } catch (error) {
        console.error("Fetch course queries failed:", error);
        return [];
      }
    },
    [student?._id],
  );

  // Add new query in state
  const addQuery = (newQuery) => {
    setQueries((prev) => [newQuery, ...prev]);
  };

  // Update single query in state
  const updateQueryInList = (updatedQuery) => {
    setQueries((prev) =>
      prev.map((q) => (q._id === updatedQuery._id ? updatedQuery : q)),
    );
  };

  useEffect(() => {
    if (student?._id) {
      fetchAllQueries();
    } else {
      setQueries([]);
    }
  }, [student?._id, fetchAllQueries]);

  return (
    <QueryContext.Provider
      value={{
        queries,
        loading,
        fetchAllQueries,
        fetchCourseQueries,
        addQuery,
        updateQueryInList,
      }}
    >
      {children}
    </QueryContext.Provider>
  );
}

export function useQueries() {
  const context = useContext(QueryContext);
  if (!context) throw new Error("useQueries must be used within QueryProvider");
  return context;
}
