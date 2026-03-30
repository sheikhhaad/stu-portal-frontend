// context/QueryContext.jsx
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
import socket from "../lib/socket"; // ✅ import socket

const QueryContext = createContext();

export function QueryProvider({ children }) {
  const { student } = useStudent();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // ✅ Now populates context so socket diffs work
  const fetchCourseQueries = useCallback(
    async (courseId) => {
      if (!student?._id || !courseId) return [];
      try {
        const res = await api.get(`/queries/${student._id}/course/${courseId}`);
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.queries || [];
        setQueries(data); // ✅ populate context
        return data;
      } catch (err) {
        console.error("Fetch course queries failed:", err);
        return [];
      }
    },
    [student?._id],
  );

  const addQuery = (newQuery) => {
    setQueries((prev) => {
      if (prev.find((q) => q._id === newQuery._id)) return prev;
      return [newQuery, ...prev];
    });
  };

  const updateQueryInList = (updatedQuery) => {
    setQueries((prev) =>
      prev.map((q) => (q._id === updatedQuery._id ? updatedQuery : q)),
    );
  };

  // ✅ refreshQueries was called in the page but never existed
  const refreshQueries = useCallback(() => {
    fetchAllQueries();
  }, [fetchAllQueries]);

  useEffect(() => {
    if (student?._id) {
      fetchAllQueries();
    } else {
      setQueries([]);
    }
  }, [student?._id, fetchAllQueries]);

  // ✅ Socket listeners — this is what was completely missing
  useEffect(() => {
    if (!student?._id) return;

    const handleNewQuery = (query) => {
      // Only care about queries belonging to this student
      if (query.student_id !== student._id) return;
      setQueries((prev) => {
        if (prev.find((q) => q._id === query._id)) return prev;
        return [query, ...prev];
      });
    };

    // ✅ This is the critical one — teacher replies update query.answer and status
    const handleUpdateQuery = (updatedQuery) => {
      if (updatedQuery.student_id !== student._id) return;
      setQueries((prev) =>
        prev.map((q) => (q._id === updatedQuery._id ? updatedQuery : q)),
      );
    };

    const handleDeleteQuery = ({ _id }) => {
      setQueries((prev) => prev.filter((q) => q._id !== _id));
    };

    socket.on("new_query", handleNewQuery);
    socket.on("update_query", handleUpdateQuery); // ✅ teacher reply arrives here
    socket.on("delete_query", handleDeleteQuery);

    return () => {
      socket.off("new_query", handleNewQuery);
      socket.off("update_query", handleUpdateQuery);
      socket.off("delete_query", handleDeleteQuery);
    };
  }, [student?._id]);

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
        refreshQueries, // ✅ was missing from provider value
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
