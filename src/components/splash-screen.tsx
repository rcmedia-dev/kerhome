'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Hide after 2 seconds
    const timer = setTimeout(() => {
      setShow(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-white"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex flex-col items-center gap-6"
          >
            <Image 
              src="/kercasa_logo.png" 
              alt="Kercasa Logo" 
              width={250} 
              height={70} 
              className="object-contain"
              style={{ width: 'auto', height: 'auto', maxWidth: '300px' }}
              priority
            />
            
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-gray-100/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                className="h-full bg-gradient-to-r from-orange-500 to-purple-600 rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
