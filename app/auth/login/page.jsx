"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { useStudent } from "@/app/context/StudentContext";
import api from "@/app/lib/api";

export default function Page() {
  const [stuId, setStuId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [qrLogin, setQrLogin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);

  const { setStudent } = useStudent();
  const router = useRouter();
  const scannerRef = useRef(null);
  const isMountedRef = useRef(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await api.post(`/auth/login`, {
        rollNumber: stuId.toUpperCase(),
        password,
      });
      if (res.status === 200) router.push("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid credentials. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
      setScannerReady(false);
    }
  };

  const startScanner = async () => {
    if (!qrLogin) return;
    await stopScanner();
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 200, height: 200 }, aspectRatio: 1.0 },
        async (decodedText) => {
          if (!isMountedRef.current || !decodedText) return;
          await stopScanner();
          setIsSubmitting(true);
          try {
            const res = await api.post(`/auth/login`, {
              rollNumber: decodedText.toUpperCase(),
            });
            localStorage.setItem(
              "studentId",
              JSON.stringify(res.data.student._id),
            );
            localStorage.setItem(
              "rollNumber",
              JSON.stringify(res.data.student.rollNumber),
            );
            setStudent(res.data.student);
            router.push("/dashboard");
          } catch {
            setError("QR login failed. Invalid or unrecognized code.");
            setQrLogin(false);
          } finally {
            setIsSubmitting(false);
          }
        },
        () => {},
      );
      setScannerReady(true);
    } catch {
      setError("Unable to access camera. Please allow camera permissions.");
      setQrLogin(false);
    }
  };

  const toggleQrLogin = async () => {
    if (qrLogin) {
      await stopScanner();
      setQrLogin(false);
      setError("");
    } else {
      setError("");
      setQrLogin(true);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    if (qrLogin) {
      const t = setTimeout(() => {
        if (isMountedRef.current) startScanner();
      }, 300);
      return () => clearTimeout(t);
    }
    return () => {
      isMountedRef.current = false;
      stopScanner();
    };
  }, [qrLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
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
            {qrLogin ? "Scan to Sign In" : "Sign In"}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {qrLogin
              ? "Point your camera at your student QR code"
              : "Enter your credentials to continue"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* ── PASSWORD FORM ── */}
          {!qrLogin ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Student ID */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Student ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. STU-12345"
                  value={stuId}
                  onChange={(e) => setStuId(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-900 placeholder-gray-300 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-14 text-sm text-gray-900 placeholder-gray-300 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
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
                className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all active:scale-[0.99] mt-1"
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
                    Signing in…
                  </>
                ) : (
                  "Continue"
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-300">
                  or
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* QR Button */}
              <button
                type="button"
                onClick={toggleQrLogin}
                className="w-full flex items-center justify-center gap-2.5 border border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 text-gray-600 text-sm font-semibold rounded-xl py-2.5 transition-all active:scale-[0.99]"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="1"
                    y="1"
                    width="5"
                    height="5"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <rect
                    x="10"
                    y="1"
                    width="5"
                    height="5"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <rect
                    x="1"
                    y="10"
                    width="5"
                    height="5"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <rect
                    x="2.5"
                    y="2.5"
                    width="2"
                    height="2"
                    fill="currentColor"
                    rx="0.3"
                  />
                  <rect
                    x="11.5"
                    y="2.5"
                    width="2"
                    height="2"
                    fill="currentColor"
                    rx="0.3"
                  />
                  <rect
                    x="2.5"
                    y="11.5"
                    width="2"
                    height="2"
                    fill="currentColor"
                    rx="0.3"
                  />
                  <path
                    d="M10 10h1.5v1.5M13.5 10v1.5H12M10 13.5h1.5v-1M13.5 12.5v1H12"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
                Sign in with QR Code
              </button>
            </motion.form>
          ) : (
            /* ── QR SCANNER ── */
            <motion.div
              key="qr"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Scanner viewport */}
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-blue-900 mb-3">
                <div id="qr-reader" className="w-full h-full" />

                {/* Corner brackets overlay */}
                {scannerReady && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-8">
                      <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-blue-400 rounded-tl" />
                      <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-blue-400 rounded-tr" />
                      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-blue-400 rounded-bl" />
                      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-blue-400 rounded-br" />
                      {/* Animated scan line */}
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                        initial={{ top: "0%" }}
                        animate={{ top: "100%" }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Loading overlay */}
                {!scannerReady && !isSubmitting && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900/95">
                    <svg
                      className="animate-spin w-7 h-7 text-blue-400"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeOpacity="0.2"
                      />
                      <path
                        d="M12 2a10 10 0 0 1 10 10"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <p className="text-xs text-gray-400 font-medium">
                      Starting camera…
                    </p>
                  </div>
                )}

                {/* Verifying overlay */}
                {isSubmitting && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900/90">
                    <svg
                      className="animate-spin w-7 h-7 text-green-400"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeOpacity="0.2"
                      />
                      <path
                        d="M12 2a10 10 0 0 1 10 10"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <p className="text-xs text-gray-300 font-medium">
                      Verifying…
                    </p>
                  </div>
                )}
              </div>

              <p className="text-center text-xs text-gray-400 mb-3">
                Align your QR code within the frame
              </p>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-medium px-3.5 py-2.5 rounded-xl mb-3 overflow-hidden"
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

              {/* Cancel */}
              <button
                onClick={toggleQrLogin}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl py-2.5 transition-all active:scale-[0.99]"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M1.5 1.5l10 10M11.5 1.5l-10 10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
