"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const SoftMenuItem = ({
  item,
  activeTab,
  setActiveTab,
  index,
}: {
  item: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  index: number;
}) => {
  const isActive = activeTab === item.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
      whileHover={{
        y: -2,
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.97 }}
      onClick={() => setActiveTab(item.id)}
      className={cn(
        "relative flex items-center justify-between p-3 mb-1 rounded-full cursor-pointer select-none transition-all duration-300",
        isActive
          ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
          : "text-gray-600 hover:bg-white hover:shadow-sm"
      )}
    >
      <div className="flex items-center space-x-3">
        <motion.div
          animate={
            isActive
              ? {
                scale: [1, 1.1, 1],
                rotate: [0, -8, 0],
              }
              : { scale: 1 }
          }
          transition={{ duration: 0.4 }}
          className={cn(
            "p-2 rounded-full transition-all duration-300",
            isActive
              ? "bg-white/20 text-white"
              : "bg-gray-100 text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-600"
          )}
        >
          <item.icon className="w-4 h-4" />
        </motion.div>

        <span
          className={cn(
            "font-medium text-sm transition-colors duration-200",
            isActive ? "text-white" : "text-gray-600"
          )}
        >
          {item.label}
        </span>
      </div>

      {item.badge !== undefined && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          className={cn(
            "px-2 py-0.5 text-[10px] font-bold rounded-full transition-all duration-300",
            isActive
              ? "bg-white text-purple-600"
              : "bg-purple-100 text-purple-600"
          )}
        >
          {item.badge}
        </motion.span>
      )}
    </motion.div>
  );
};

export default SoftMenuItem;
