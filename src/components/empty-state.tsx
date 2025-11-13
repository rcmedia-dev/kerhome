import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const EmptyState = ({ 
  message, 
  icon: Icon,
  className 
}: { 
  message: string; 
  icon?: any;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className={cn(
      "text-center py-12 px-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200",
      className
    )}
  >
    {Icon && (
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
    )}
    <p className="text-gray-500 text-lg font-medium">{message}</p>
  </motion.div>
);

const AnimatedGrid = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    layout
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
  >
    {children}
  </motion.div>
);

export { EmptyState, AnimatedGrid };