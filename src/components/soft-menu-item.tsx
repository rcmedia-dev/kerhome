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
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
      whileHover={{
        scale: 1.01,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setActiveTab(item.id)}
      className={cn(
        "relative flex items-center justify-between p-3 mb-1.5 rounded-md cursor-pointer select-none transition-all duration-300",
        isActive
          ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-md shadow-purple-200"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200"
      )}
    >
      <div className="flex items-center space-x-3">
        <div
          className={cn(
            "p-2 rounded-md transition-all duration-300",
            isActive
              ? "bg-white/20 text-white"
              : "bg-gray-100 text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-600"
          )}
        >
          <item.icon className="w-4 h-4" />
        </div>

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
        <span
          className={cn(
            "px-2 py-0.5 text-[10px] font-bold rounded-md transition-all duration-300",
            isActive
              ? "bg-white text-purple-600"
              : "bg-purple-100 text-purple-600"
          )}
        >
          {item.badge}
        </span>
      )}
    </motion.div>
  );
};

export default SoftMenuItem;
