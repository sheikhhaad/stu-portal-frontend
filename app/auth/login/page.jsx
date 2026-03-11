"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, QrCode, ShieldAlert, Loader2, X } from "lucide-react";
import { useStudent } from "@/app/context/StudentContext";
import api from "@/app/lib/api";

export default function Page() {
  const [stuId, setStuId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [qrLogin, setQrLogin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      localStorage.setItem("studentId", JSON.stringify(res.data.student._id));
      localStorage.setItem(
        "rollNumber",
        JSON.stringify(res.data.student.rollNumber),
      );
      setStudent(res.data.student);

      if (res.status === 200) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.log("Backend error:", err);
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
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
        scannerRef.current = null;
      } catch (err) {
        console.log("Error stopping scanner:", err);
        scannerRef.current = null;
      }
    }
  };

  const startScanner = async () => {
    if (!qrLogin) return;
    await stopScanner();

    const qrCodeScanner = new Html5Qrcode("qr-reader");
    scannerRef.current = qrCodeScanner;

    const qrConfig = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    try {
      await qrCodeScanner.start(
        { facingMode: "environment" },
        qrConfig,
        async (decodedText) => {
          if (!isMountedRef.current) return;
          if (decodedText) {
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
            } catch (err) {
              setError("QR login failed. User not found or invalid QR.");
              setQrLogin(false);
            } finally {
              setIsSubmitting(false);
            }
          }
        },
        () => {},
      );
    } catch (err) {
      console.error("Scanner start error:", err);
      setError("Unable to access camera");
      setQrLogin(false);
    }
  };

  const toggleQrLogin = async () => {
    if (qrLogin) {
      await stopScanner();
      setQrLogin(false);
    } else {
      setError("");
      setQrLogin(true);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    if (qrLogin) {
      const timer = setTimeout(() => {
        if (isMountedRef.current) startScanner();
      }, 200);
      return () => clearTimeout(timer);
    }
    return () => {
      isMountedRef.current = false;
      stopScanner();
    };
  }, [qrLogin]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 p-4 font-inter">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border border-white w-full max-w-md p-8 rounded-3xl shadow-2xl relative"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200"
          >
            <LogIn className="text-white w-8 h-8" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-gray-500 mt-2">
            Enter your credentials to continue
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!qrLogin ? (
            <motion.form
              key="login-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  Student ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. STU-12345"
                  value={stuId}
                  onChange={(e) => setStuId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all text-gray-900"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all text-gray-900"
                  required
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-2 border border-red-100"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-100"></span>
                </div>
                <span className="relative px-4 bg-white text-gray-400 text-sm uppercase tracking-widest font-bold">
                  Or
                </span>
              </div>

              <button
                onClick={toggleQrLogin}
                type="button"
                className="w-full flex items-center gap-3 justify-center py-4 rounded-2xl border-2 border-gray-100 text-gray-700 font-bold hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                <QrCode className="w-5 h-5 text-indigo-600" />
                Scan QR Code
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="qr-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mt-4"
            >
              <div className="relative bg-gray-50 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 aspect-square flex items-center justify-center">
                <div id="qr-reader" className="w-full h-full"></div>
                {!scannerRef.current && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="text-sm font-medium">
                      Initializing camera...
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-2 border border-red-100 mt-4">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={toggleQrLogin}
                className="mt-6 w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancel Scanning
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center mt-8 text-gray-500 font-medium">
          New here?{" "}
          <Link
            href="/auth/register"
            className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
          >
            Create an Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
