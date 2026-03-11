"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useStudent } from "./StudentContext";
import api from "../lib/api";

const QueryContext = createContext();

export function QueryProvider({ children }) {
  const { student } = useStudent();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all queries of logged student
  const fetchAllQueries = useCallback(async () => {
    if (!student?._id) return;

    try {
      setLoading(true);
      setError(null);

      const res = await api.get(`/queries/all`);

      const fetchedQueries = Array.isArray(res.data)
        ? res.data
        : res.data.queries || [];
      setQueries(fetchedQueries);
    } catch (err) {
      console.error("Fetch all queries failed:", err);
      setError("Failed to load queries");
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
        const res = await api.get(`/queries/${student._id}/course/${courseId}`);

        return Array.isArray(res.data) ? res.data : res.data.queries || [];
      } catch (err) {
        console.error("Fetch course queries failed:", err);
        return [];
      }
    },
    [student?._id],
  );

  // Add new query in state
  const addQuery = (newQuery) => {
    setQueries((prev) => [newQuery, ...prev]);
  };

  // Update single query in list
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
        error,
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
