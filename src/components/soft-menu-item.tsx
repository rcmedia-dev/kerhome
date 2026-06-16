"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const SoftMenuItem = ({
  item,
  activeTab,
  setActiveTab,
  index,
  isCollapsed,
}: {
  item: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  index: number;
  isCollapsed?: boolean;
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
          ? "bg-white text-purple-700 shadow-sm border border-gray-100"
          : "text-gray-500 hover:bg-gray-50/80 hover:text-gray-900 border border-transparent",
        isCollapsed && "justify-center px-2"
      )}
      title={isCollapsed ? item.label : undefined}
    >
      <div className="flex items-center space-x-3">
        <div
          className={cn(
            "p-2 rounded-md transition-all duration-300",
            isActive
              ? "bg-purple-50 text-purple-600"
              : isCollapsed
                ? "bg-gray-200 text-gray-600 hover:bg-purple-100 hover:text-purple-600"
                : "bg-gray-100 text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-600"
          )}
        >
          <item.icon className="w-4 h-4" />
        </div>

        {!isCollapsed && (
          <span
            className={cn(
              "font-bold text-sm transition-colors duration-200 whitespace-nowrap",
              isActive ? "text-purple-700" : "text-gray-500"
            )}
          >
            {item.label}
          </span>
        )}
      </div>

      {!isCollapsed && item.badge !== undefined && (
        <span
          className={cn(
            "px-2.5 py-0.5 text-[10px] font-black rounded-md transition-all duration-300",
            isActive
              ? "bg-purple-100 text-purple-700"
              : "bg-gray-100 text-gray-400"
          )}
        >
          {item.badge}
        </span>
      )}
    </motion.div>
  );
};

export default SoftMenuItem;

