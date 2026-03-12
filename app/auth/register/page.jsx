"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/app/lib/api";

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cnic, setCnic] = useState("");
  const [stuId, setStuId] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`/auth/register`, {
        rollNumber: stuId.toUpperCase(),
        email,
        password,
        cnic,
      });
      if (res.status === 200) router.push("/auth/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    {
      label: "Email Address",
      type: "email",
      placeholder: "you@university.edu",
      value: email,
      onChange: setEmail,
      autoComplete: "email",
      mono: false,
    },
    {
      label: "Student ID",
      type: "text",
      placeholder: "e.g. STU-12345",
      value: stuId,
      onChange: setStuId,
      autoComplete: "off",
      mono: true,
    },
    {
      label: "CNIC",
      type: "text",
      placeholder: "e.g. 42101-1234567-1",
      value: cnic,
      onChange: setCnic,
      autoComplete: "off",
      mono: true,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
      >
        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">
              Student Portal
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Create Account
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Fill in your details to register
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Text fields */}
          {fields.map((f) => (
            <div key={f.label}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                {f.label}
              </label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                required
                autoComplete={f.autoComplete}
                className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-blue-900 placeholder-gray-300 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all ${f.mono ? "font-mono" : ""}`}
              />
            </div>
          ))}

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-14 text-sm bg-blue-900 placeholder-gray-300 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-blue-600 transition-colors"
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 pr-14 text-sm bg-blue-900 placeholder-gray-300 outline-none focus:bg-white focus:ring-2 transition-all ${
                  confirmPassword && confirmPassword !== password
                    ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
                    : confirmPassword && confirmPassword === password
                      ? "border-green-300 focus:border-green-400 focus:ring-green-500/10"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/10"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-blue-600 transition-colors"
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
              {/* Match indicator */}
              {confirmPassword && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2">
                  {confirmPassword === password ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" fill="#dcfce7" />
                      <path
                        d="M4 7l2.5 2.5L10 4.5"
                        stroke="#16a34a"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" fill="#fee2e2" />
                      <path
                        d="M4.5 4.5l5 5M9.5 4.5l-5 5"
                        stroke="#dc2626"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-medium px-3.5 py-2.5 rounded-xl overflow-hidden"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                  className="shrink-0"
                >
                  <circle cx="6.5" cy="6.5" r="6" stroke="#dc2626" />
                  <path
                    d="M6.5 3.5v3.2M6.5 9v.5"
                    stroke="#dc2626"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all active:scale-[0.99] mt-1"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="white"
                    strokeWidth="3"
                    strokeOpacity="0.3"
                  />
                  <path
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                Creating account…
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
