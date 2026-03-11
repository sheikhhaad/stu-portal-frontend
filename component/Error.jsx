"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCcw } from "lucide-react";

const Error = ({ message = "An error occurred", onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[300px] w-full p-8 text-center"
    >
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 shadow-sm max-w-md w-full">
        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Oops!</h3>
        <p className="text-gray-600 mb-6">{message}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-red-200 active:scale-95"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Error;
