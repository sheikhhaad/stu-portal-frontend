// context/QueryContext.jsx (Student Portal)
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
import { socket } from "../lib/socket"; // ✅ import socket instance

const QueryContext = createContext();

export function QueryProvider({ children }) {
  const { student } = useStudent();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all queries for the student (initial load)
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

  // Fetch queries for a specific course and update context
  const fetchCourseQueries = useCallback(
    async (courseId) => {
      if (!student?._id || !courseId) return [];
      try {
        const res = await api.get(`/queries/${student._id}/course/${courseId}`);
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.queries || [];
        setQueries(data);
        return data;
      } catch (err) {
        console.error("Fetch course queries failed:", err);
        return [];
      }
    },
    [student?._id]
  );

  // Manually add a new query to the list (optimistic update)
  const addQuery = (newQuery) => {
    setQueries((prev) => {
      if (prev.find((q) => q._id === newQuery._id)) return prev;
      return [newQuery, ...prev];
    });
  };

  // Update an existing query in the list (e.g., after answer)
  const updateQueryInList = (updatedQuery) => {
    setQueries((prev) =>
      prev.map((q) => (q._id === updatedQuery._id ? updatedQuery : q))
    );
  };

  // Refresh by re‑fetching all queries
  const refreshQueries = useCallback(() => {
    fetchAllQueries();
  }, [fetchAllQueries]);

  // Auto‑fetch all queries when student logs in
  useEffect(() => {
    if (student?._id) {
      fetchAllQueries();
    } else {
      setQueries([]);
    }
  }, [student?._id, fetchAllQueries]);

  // ✅ Socket listeners for real‑time updates (new, update, delete)
  useEffect(() => {
    if (!student?._id) return;
    if (!socket.connected) socket.connect();

    const handleNewQuery = (query) => {
      // Only add if the query belongs to this student
      if (query.student_id !== student._id) return;
      setQueries((prev) => {
        if (prev.find((q) => q._id === query._id)) return prev;
        return [query, ...prev];
      });
    };

    const handleUpdateQuery = (updatedQuery) => {
      // Only update if it belongs to this student
      if (updatedQuery.student_id !== student._id) return;
      setQueries((prev) =>
        prev.map((q) => (q._id === updatedQuery._id ? updatedQuery : q))
      );
    };

    const handleDeleteQuery = ({ id }) => {
      setQueries((prev) => prev.filter((q) => q._id !== id));
    };

    socket.on("new_query", handleNewQuery);
    socket.on("update_query", handleUpdateQuery);
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
        refreshQueries,
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