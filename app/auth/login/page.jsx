"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";

export default function Page() {
  const [stuId, setStuId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [qrLogin, setQrLogin] = useState(false);

  const router = useRouter();
  const scannerRef = useRef(null);
  const isMountedRef = useRef(true);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        `https://stu-portal-backend.vercel.app/api/auth/login`,
        {
          rollNumber: stuId.toUpperCase(),
          password,
        },
        { withCredentials: true },
      );
      console.log(res.data);

      // store ObjectId instead of rollNumber
      localStorage.setItem("studentId", JSON.stringify(res.data.student._id));
      localStorage.setItem(
        "rollNumber",
        JSON.stringify(res.data.student.rollNumber),
      );

      if (res.status === 200) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.log("Backend error:", err);
      setError("Login failed");
    }
  };
  // Stop QR Scanner
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const qrReaderElement = document.getElementById("qr-reader");
        if (qrReaderElement) qrReaderElement.style.display = "none";

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

    await stopScanner(); // ensure no old scanner is running

    const qrReaderElement = document.getElementById("qr-reader");
    if (qrReaderElement) qrReaderElement.style.display = "block";

    const qrCodeScanner = new Html5Qrcode("qr-reader");
    scannerRef.current = qrCodeScanner;

    const qrConfig = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    await qrCodeScanner.start(
      { facingMode: "environment" },
      qrConfig,
      async (decodedText) => {
        console.log("Scanned:", decodedText);
        if (!isMountedRef.current) return;

        if (decodedText) {
          await stopScanner();
          console.log(decodedText);

          try {
            const res = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
              { rollNumber: decodedText.toUpperCase() },
              { withCredentials: true },
            );

            // Store ObjectId for consistent fetching later
            localStorage.setItem(
              "studentId",
              JSON.stringify(res.data.student._id),
            );

            if (res.status === 200) {
              router.push("/dashboard");
            } else {
              setError("Backend login failed");
            }
          } catch (err) {
            console.log("Backend error:", err);
            setError("Backend login failed");
          }
        } else {
          setError("Invalid QR Code");
        }
      },
      (errorMessage) => {
        // ignore scan errors
      },
    );
  };

  // Toggle QR login
  const toggleQrLogin = async () => {
    if (qrLogin) {
      await stopScanner();
      setQrLogin(false);
    } else {
      setError("");
      setQrLogin(true);
    }
  };

  // Effect for QR login
  useEffect(() => {
    isMountedRef.current = true;

    if (qrLogin) {
      const timer = setTimeout(() => {
        if (isMountedRef.current) startScanner();
      }, 200);

      return () => clearTimeout(timer);
    } else stopScanner();

    return () => {
      isMountedRef.current = false;
      stopScanner();
    };
  }, [qrLogin]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopScanner();
    };
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white text-gray-600 w-full max-w-md mx-4 p-6 rounded-xl shadow-lg relative">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Student Login
        </h2>

        {!qrLogin && (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Enter your Student ID"
                value={stuId}
                onChange={(e) => setStuId(e.target.value)}
                className="w-full border border-gray-300 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              <button
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-full transition duration-300"
              >
                Log In
              </button>
            </form>

            <button
              onClick={toggleQrLogin}
              type="button"
              className="w-full flex items-center gap-2 justify-center mt-4 bg-white border border-gray-300 py-2 rounded-full text-gray-800 hover:bg-gray-50 transition"
            >
              <img className="h-4 w-4" src="/qr-code.png" alt="qrCodeIcon" />
              Log in with QR Code
            </button>
          </>
        )}

        {qrLogin && (
          <div className="mt-4">
            <div id="qr-reader" className="w-full"></div>
            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
            <button
              onClick={toggleQrLogin}
              className="mt-4 w-full bg-red-500 text-white py-2 rounded-full hover:bg-red-600 transition"
            >
              Cancel
            </button>
          </div>
        )}

        <p className="text-center mt-5 text-sm">
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            className="text-indigo-500 hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
