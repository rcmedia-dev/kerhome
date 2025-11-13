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
        "relative flex items-center justify-between p-4 rounded-xl cursor-pointer select-none transition-all duration-300 backdrop-blur-sm border shadow-sm",
        isActive
          ? "bg-gradient-to-r from-orange-100/80 to-orange-200/70 border-orange-300 shadow-md"
          : "bg-white/60 hover:bg-orange-50/60 hover:border-orange-200 border-transparent"
      )}
    >
      {/* Glow decorativo ativo */}
      {isActive && (
        <motion.div
          layoutId="menu-glow"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-200/60 to-transparent blur-md -z-10"
        />
      )}

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
            "p-2 rounded-lg transition-all duration-300 shadow-sm",
            isActive
              ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white"
              : "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 group-hover:from-orange-100 group-hover:to-orange-200 group-hover:text-orange-600"
          )}
        >
          <item.icon className="w-4 h-4" />
        </motion.div>

        <span
          className={cn(
            "font-medium tracking-wide transition-colors duration-200",
            isActive ? "text-orange-700" : "text-gray-700 group-hover:text-orange-600"
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
            "px-2 py-1 text-xs font-semibold rounded-full transition-all duration-300 shadow-sm",
            isActive
              ? "bg-orange-500 text-white"
              : "bg-gray-100 text-gray-600 group-hover:bg-orange-500 group-hover:text-white"
          )}
        >
          {item.badge}
        </motion.span>
      )}
    </motion.div>
  );
};

export default SoftMenuItem;
