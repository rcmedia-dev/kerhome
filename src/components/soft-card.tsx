import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Card com animação suave
const SoftCard = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    whileHover={{ 
      y: -2,
      transition: { duration: 0.2 }
    }}
    className={cn(
      "bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300",
      className
    )}
  >
    {children}
  </motion.div>
);

export default SoftCard;