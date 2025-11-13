import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Efeito de partículas suaves para o background
const SoftBackground = () => {
  const [dimensions, setDimensions] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDimensions({ w: window.innerWidth, h: window.innerHeight });
    }
  }, []);

  if (dimensions.w === 0 || dimensions.h === 0) return null; // Evita render no SSR

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-purple-100 to-orange-100 opacity-20"
          initial={{
            x: Math.random() * dimensions.w,
            y: Math.random() * dimensions.h,
          }}
          animate={{
            x: [null, Math.random() * dimensions.w],
            y: [null, Math.random() * dimensions.h],
          }}
          transition={{
            duration: 20 + Math.random() * 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
};

export default SoftBackground;