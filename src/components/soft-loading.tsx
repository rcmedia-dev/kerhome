import { motion } from "framer-motion";

// Loading suave e elegante
const SoftLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-orange-50 flex items-center justify-center">
    <div className="text-center">
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"
      />
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-600 font-medium"
      >
        Carregando seu espaço...
      </motion.p>
    </div>
  </div>
);

export default SoftLoading;