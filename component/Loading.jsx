"use client";

import React from "react";
import { motion } from "framer-motion";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
          borderRadius: ["20%", "50%", "20%"],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          times: [0, 0.5, 1],
          repeat: Infinity,
        }}
        className="w-16 h-16 bg-linear-to-tr from-indigo-500 to-purple-600 shadow-xl"
      />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-indigo-800 font-medium text-lg animate-pulse"
      >
        {message}
      </motion.p>
    </div>
  );
};

export default Loading;
