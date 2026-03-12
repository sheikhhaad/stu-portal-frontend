"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";

const Error = ({ message = "An error occurred", onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 text-center"
    >
      <div className="max-w-sm w-full">
        <div className="w-16 h-16 bg-sky-50 border border-sky-100 rounded-4xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <AlertCircle className="w-8 h-8 text-blue-600" />
        </div>
        
        <h3 className="text-xl font-black text-blue-900 mb-2 tracking-tight uppercase">System Interruption</h3>
        <p className="text-blue-400 text-sm mb-8 leading-relaxed font-medium">
          {message}
        </p>

        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl shadow-blue-100"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Attempt Recover
            </button>
          )}
          
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full bg-white border border-sky-100 text-sky-400 hover:text-blue-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return Home
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default Error;
