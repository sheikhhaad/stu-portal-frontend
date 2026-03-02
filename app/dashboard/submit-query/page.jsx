"use client";

import { useEffect, useState } from "react";
import { useStudent } from "@/app/context/StudentContext";
import { useQueries } from "@/app/context/QueryContext";
import { useRouter } from "next/navigation";
import { Send, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";

export default function SubmitQuery() {
  const { student } = useStudent();
  const { addQuery } = useQueries();
  const router = useRouter();
  const [formData, setFormData] = useState({
    course: "",
    instructor: "",
    query: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student?._id) return;

    setIsSubmitting(true);

    try {
      const payload = {
        student_id: student._id,
        course: formData.course,
        instructor: formData.instructor,
        query: formData.query,
        status: "pending",
      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/queries/create`,
        payload,
        { withCredentials: true },
      );

      if (res.status === 201 || res.status === 200) {
        const newQuery = res.data.query || res.data;
        addQuery(newQuery);
        setFormData({ course: "", instructor: "", query: "" });
        router.push("/dashboard/my-query");
      }
    } catch (error) {
      console.error(
        "Error submitting query:",
        error.response?.data || error.message,
      );
      alert("Failed to submit query. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Submit a New Query</h1>
        <p className="text-gray-500 mt-2">
          Fill out the details below to raise a concern or ask a question.
        </p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="course"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Course
              </label>
              <input
                type="text"
                id="course"
                name="course"
                required
                value={formData.course}
                onChange={handleChange}
                placeholder="e.g. Assignment Extension"
                className="input-field"
              />
            </div>

            <div>
              <label
                htmlFor="instructor"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Instructor/Department
              </label>
              <select
                id="instructor"
                name="instructor"
                required
                value={formData.instructor}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select Recipient</option>
                <option value="Dr. Smith">Dr. Smith (Computer Science)</option>
                <option value="Prof. Johnson">Prof. Johnson (Physics)</option>
                <option value="Dr. Williams">Dr. Williams (Mathematics)</option>
                <option value="Administration">Administration</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="query"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Type your Query
            </label>
            <textarea
              id="query"
              name="query"
              required
              rows="6"
              value={formData.query}
              onChange={handleChange}
              placeholder="Please provide detailed information about your query..."
              className="input-field resize-none"
            ></textarea>
            <p className="text-xs text-gray-400 mt-2 text-right">
              0/500 characters
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-500">
              <AlertCircle className="h-4 w-4 mr-2 text-indigo-500" />
              Most queries are resolved within 48 hours.
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn-primary flex items-center gap-2 ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  Submit Query
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
