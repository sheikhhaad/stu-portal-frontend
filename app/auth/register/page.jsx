"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Page() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [cnic, setCnic] = useState("");
    const [stuId, setStuId] = useState("");


    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Password match check
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (email === "" || password === "" || cnic === "" || stuId === "") {
            alert("Please fill all the fields");
            return;
        }
        localStorage.setItem("email", email);
        localStorage.setItem("password", password);
        localStorage.setItem("cnic", cnic);
        localStorage.setItem("stuId", stuId.toUpperCase());
        router.push("/auth/login");

    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white text-gray-600 w-full max-w-md mx-4 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                    Create Account
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full border border-gray-300 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="text"
                        placeholder="Enter your CNIC"
                        className="w-full border border-gray-300 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                        value={cnic}
                        onChange={(e) => setCnic(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Enter your Student ID"
                        className="w-full border border-gray-300 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                        value={stuId}
                        onChange={(e) => setStuId(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Enter your password"
                        className="w-full border border-gray-300 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Confirm your password"
                        className="w-full border border-gray-300 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    {success && (
                        <p className="text-green-500 text-sm text-center">{success}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-full transition duration-300"
                    >
                        Register
                    </button>
                </form>

                <p className="text-center mt-5 text-sm">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-indigo-500 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
