"use client";

import React from "react";
import { motion } from "framer-motion";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 text-center">
      <div className="relative w-16 h-16">
        {/* Animated outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-t-2 border-blue-600 rounded-full"
        />
        {/* Pulsing center dot */}
        <motion.div
           animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
           transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
           className="absolute inset-4 bg-sky-400 rounded-lg shadow-xl shadow-sky-100"
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 space-y-2"
      >
        <p className="text-blue-900 font-black text-sm uppercase tracking-[0.3em] leading-none">
          {message}
        </p>
        <p className="text-[10px] text-sky-500 font-bold uppercase tracking-widest">
          Optimizing your experience
        </p>
      </motion.div>
    </div>
  );
};

export default Loading;
