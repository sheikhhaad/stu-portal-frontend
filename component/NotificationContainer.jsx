"use client";

import React from "react";
import { useNotification } from "@/app/context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  MessageCircle, 
  Megaphone, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  HelpCircle,
  Bell
} from "lucide-react";

const getIcon = (type, customIcon) => {
  if (customIcon === "MessageCircle") return <MessageCircle className="w-5 h-5 text-blue-500" />;
  if (customIcon === "Megaphone") return <Megaphone className="w-5 h-5 text-purple-500" />;
  if (customIcon === "HelpCircle") return <HelpCircle className="w-5 h-5 text-orange-500" />;
  if (customIcon === "Bell") return <Bell className="w-5 h-5 text-sky-500" />;
  
  switch (type) {
    case "success": return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case "error": return <AlertCircle className="w-5 h-5 text-rose-500" />;
    case "warning": return <AlertCircle className="w-5 h-5 text-amber-500" />;
    default: return <Info className="w-5 h-5 text-sky-500" />;
  }
};

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-9999 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            layout
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
            className="pointer-events-auto relative group border border-gray-100 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm bg-white/95 flex items-start gap-4 overflow-hidden"
          >
            {/* Type Indicator Line */}
            <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
              n.type === 'success' ? 'bg-emerald-500' :
              n.type === 'error' ? 'bg-rose-500' :
              n.type === 'warning' ? 'bg-amber-500' :
              n.type === 'message' ? 'bg-blue-500' :
              n.type === 'announcement' ? 'bg-purple-500' :
              'bg-sky-500'
            }`} />

            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {getIcon(n.type, n.icon)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-6">
              <h4 className="text-sm font-semibold text-gray-900 leading-tight mb-1">
                {n.title}
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed font-medium line-clamp-2">
                {n.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeNotification(n.id)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Auto-dismiss progress bar (optional, but looks nice) */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: n.duration / 1000, ease: "linear" }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 origin-left opacity-30"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
