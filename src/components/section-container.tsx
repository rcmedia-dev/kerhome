import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Reutilizando os componentes do seu código
const SectionContainer = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className={cn(
      "bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6",
      className
    )}
  >
    {children}
  </motion.div>
);

export default SectionContainer;